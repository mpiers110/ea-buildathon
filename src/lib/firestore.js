"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ============ COLLECTIONS ============
const CONSULTATIONS = "consultations";
const RECORDS = "records"; // EHRs
const ANALYSES = "analyses"; // Image analyses

// ============ CONSULTATIONS ============

/**
 * Create a new consultation session
 */
export async function createConsultation(sessionId, data = {}) {
  try {
    const docRef = doc(db, CONSULTATIONS, sessionId);
    const { setDoc } = await import("firebase/firestore");
    await setDoc(docRef, {
      sessionId,
      startedAt: serverTimestamp(),
      messages: [],
      triageLevel: null,
      status: "active",
      ...data,
    });
    return sessionId;
  } catch (error) {
    console.error("Error creating consultation:", error);
    throw error;
  }
}

/**
 * Update consultation with new messages and triage level
 */
export async function updateConsultation(sessionId, { messages, triageLevel }) {
  try {
    const docRef = doc(db, CONSULTATIONS, sessionId);
    const updateData = {
      updatedAt: serverTimestamp(),
    };
    if (messages) updateData.messages = messages;
    if (triageLevel) updateData.triageLevel = triageLevel;
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating consultation:", error);
    throw error;
  }
}

/**
 * Get a single consultation by session ID
 */
export async function getConsultation(sessionId) {
  try {
    const docRef = doc(db, CONSULTATIONS, sessionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting consultation:", error);
    throw error;
  }
}

/**
 * List all consultations, ordered by most recent
 */
export async function listConsultations() {
  try {
    const q = query(
      collection(db, CONSULTATIONS),
      orderBy("startedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error listing consultations:", error);
    return [];
  }
}

/**
 * Get consultation count
 */
export async function getConsultationCount() {
  try {
    const snapshot = await getDocs(collection(db, CONSULTATIONS));
    return snapshot.size;
  } catch (error) {
    console.error("Error counting consultations:", error);
    return 0;
  }
}

// ============ EHR RECORDS ============

/**
 * Save an EHR record
 */
export async function saveRecord(recordData) {
  try {
    const docRef = await addDoc(collection(db, RECORDS), {
      ...recordData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving record:", error);
    throw error;
  }
}

/**
 * Get a single record by ID
 */
export async function getRecord(recordId) {
  try {
    const docRef = doc(db, RECORDS, recordId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting record:", error);
    throw error;
  }
}

/**
 * List all EHR records, ordered by most recent
 */
export async function listRecords() {
  try {
    const q = query(collection(db, RECORDS), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to ISO string for serialization
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      };
    });
  } catch (error) {
    console.error("Error listing records:", error);
    return [];
  }
}

/**
 * Delete a record
 */
export async function deleteRecord(recordId) {
  try {
    await deleteDoc(doc(db, RECORDS, recordId));
  } catch (error) {
    console.error("Error deleting record:", error);
    throw error;
  }
}

/**
 * Get record count
 */
export async function getRecordCount() {
  try {
    const snapshot = await getDocs(collection(db, RECORDS));
    return snapshot.size;
  } catch (error) {
    console.error("Error counting records:", error);
    return 0;
  }
}

/**
 * Get count of high urgency records
 */
export async function getHighUrgencyCount() {
  try {
    const snapshot = await getDocs(collection(db, RECORDS));
    return snapshot.docs.filter((doc) => {
      const level = doc.data().triageLevel;
      return level === "HIGH" || level === "EMERGENCY";
    }).length;
  } catch (error) {
    console.error("Error counting high urgency:", error);
    return 0;
  }
}

// ============ IMAGE ANALYSES ============

/**
 * Save an image analysis result
 */
export async function saveAnalysis(analysisData) {
  try {
    const docRef = await addDoc(collection(db, ANALYSES), {
      ...analysisData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving analysis:", error);
    throw error;
  }
}

/**
 * List all image analyses, ordered by most recent
 */
export async function listAnalyses() {
  try {
    const q = query(collection(db, ANALYSES), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error listing analyses:", error);
    return [];
  }
}

/**
 * Get analysis count
 */
export async function getAnalysisCount() {
  try {
    const snapshot = await getDocs(collection(db, ANALYSES));
    return snapshot.size;
  } catch (error) {
    console.error("Error counting analyses:", error);
    return 0;
  }
}

// ============ DASHBOARD STATS ============

/**
 * Get all dashboard stats in one call
 */
export async function getDashboardStats() {
  try {
    const [consultations, records, analyses] = await Promise.all([
      getConsultationCount(),
      getRecordCount(),
      getAnalysisCount(),
    ]);

    const highUrgency = await getHighUrgencyCount();

    return {
      consultations,
      records,
      images: analyses,
      triageHigh: highUrgency,
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return { consultations: 0, records: 0, images: 0, triageHigh: 0 };
  }
}
