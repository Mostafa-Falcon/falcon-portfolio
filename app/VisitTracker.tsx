"use client";

import { useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/db/config-firebase";

// 🔹 تمييز نوع الجهاز
function getDeviceType() {
    if (typeof navigator === "undefined") return "unknown";
    return /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

// 🔹 إضافة أو تحديث الزيارة
async function recordVisit(deviceType: "mobile" | "desktop" | "unknown") {
    const today = new Date().toISOString().slice(0, 10);  // YYYY-MM-DD
    const docRef = doc(db, 'portfolio', "visits", today);

    const existing = await getDoc(docRef);

    if (existing.exists()) {
        await updateDoc(docRef, {
            [deviceType]: increment(1)
        });
    } else {
        await setDoc(docRef, {
            date: today,
            desktop: deviceType === "desktop" ? 1 : 0,
            mobile: deviceType === "mobile" ? 1 : 0
        });
    }
}

export default function VisitTracker() {
    useEffect(() => {
        // سجل مرة واحدة في اليوم لكل زائر
        const lastLogged = localStorage.getItem("visit-logged");
        const today = new Date().toISOString().slice(0, 10);

        // if (lastLogged !== today) {
            const device = getDeviceType();
            recordVisit(device);
            localStorage.setItem("visit-logged", today);
        // }
    }, []);

    return null;
}
