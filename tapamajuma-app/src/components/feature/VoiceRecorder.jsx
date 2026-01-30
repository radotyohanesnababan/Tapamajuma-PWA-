import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";
import { toast } from "sonner";

export default function VoiceRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Buat objek file agar bisa diunggah via FormData
        const file = new File([audioBlob], `rekaman-${Date.now()}.mp3`, { type: 'audio/mpeg' });
        onRecordingComplete(file); // Kirim file ke parent component (StudentGallery)
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch {
      toast.error("Gagal akses mikrofon. Pastikan izin diberikan.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    // Matikan mikrofon setelah selesai
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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