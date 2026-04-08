/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Capacitor } from '@capacitor/core';

export default function VoiceRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  // Web refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ─── Native (Capacitor) ───────────────────────────────────────

const startRecordingNative = async () => {
  try {
    const { CapacitorMicrophone } = await import('@mozartec/capacitor-microphone');
    
    const permission = await CapacitorMicrophone.requestPermissions();
    console.log('Permission:', JSON.stringify(permission));

    if (permission.microphone === 'granted') {
      await CapacitorMicrophone.startRecording();
      setIsRecording(true);
      console.log('Recording started!');
    } else {
      toast.error("Izin mikrofon ditolak.");
    }

  } catch (err) {
    console.error('Error:', err.name, err.message);
    toast.error("Gagal merekam: " + err.message);
  }
};

const stopRecordingNative = async () => {
  try {
    const { CapacitorMicrophone } = await import('@mozartec/capacitor-microphone');
    const result = await CapacitorMicrophone.stopRecording();
    console.log('Result:', JSON.stringify(result));

    const base64 = result.base64Sound;
    const mimeType = 'audio/aac';
    const byteChars = atob(base64);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArray[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const file = new File([blob], `rekaman-${Date.now()}.aac`, { type: mimeType });

    setAudioUrl(url);
    onRecordingComplete(file);

  } catch (err) {
    console.error('Error:', err.name, err.message);
    toast.error("Gagal stop rekaman: " + err.message);
  } finally {
    setIsRecording(false);
  }
};

  // ─── Web (Browser Fallback) ───────────────────────────────────
  const startRecordingWeb = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const file = new File([blob], `rekaman-${Date.now()}.mp3`, { type: 'audio/mpeg' });
        setAudioUrl(url);
        onRecordingComplete(file);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch {
      toast.error("Gagal akses mikrofon. Pastikan izin diberikan.");
    }
  };

  const stopRecordingWeb = () => {
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
  };

  // ─── Unified Handler ──────────────────────────────────────────
  const startRecording = () => {
    if (Capacitor.isNativePlatform()) {
      startRecordingNative();
    } else {
      startRecordingWeb();
    }
  };

  const stopRecording = () => {
    if (Capacitor.isNativePlatform()) {
      stopRecordingNative();
    } else {
      stopRecordingWeb();
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    onRecordingComplete(null);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100 border-dashed">
      {!audioUrl ? (
        <>
          <p className="text-[10px] font-bold text-indigo-400 mb-3 uppercase tracking-tighter">
            {isRecording ? "Sedang Merekam..." : "Rekam Cerita Suara"}
          </p>
          {!isRecording ? (
            <Button onClick={startRecording} type="button" className="rounded-full w-12 h-12 bg-indigo-600">
              <Mic size={24} />
            </Button>
          ) : (
            <Button onClick={stopRecording} type="button" variant="destructive" className="rounded-full w-12 h-12 animate-pulse">
              <Square size={20} />
            </Button>
          )}
        </>
      ) : (
        <div className="w-full space-y-3">
          <audio src={audioUrl} controls className="w-full h-8" />
          <Button onClick={resetRecording} variant="outline" size="sm" className="w-full text-xs text-rose-500 border-rose-200">
            <Trash2 size={14} className="mr-1" /> Hapus & Rekam Ulang
          </Button>
        </div>
      )}
    </div>
  );
}