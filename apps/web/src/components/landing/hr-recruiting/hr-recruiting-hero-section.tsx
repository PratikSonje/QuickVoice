"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect , useState , useRef} from "react";
import AudioPlayer from "react-h5-audio-player";

import { Player } from "@/components/audioPlayer";
import { TypingTranscript, type TranscriptLine } from "@/components/TranscriptPlayer";
import hrRecruitingData from "@/data/industries/hr-recruiting-images.json";
import { generateDownloadUrl } from "@/utils/s3Ops";


export function HrRecruitingHeroSection() {
  const folderName = "Voice-agents/marketing/demo-voices";
const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<AudioPlayer | null>(null);

  /** Fetch audio */
  useEffect(() => {
    async function fetchAudio() {
      try {
        const res = await generateDownloadUrl(folderName, hrRecruitingData.hr);
         //  console.log("Fetched audio URL:", data.url);
              setAudioUrl(res);
      } catch (err) {
        console.error("Failed to load audio demo", err);
      }
    }

    fetchAudio();
  }, []);

  
  useEffect(() => {
    const audio = audioRef.current?.audio.current;
    
    if (!audio) return;
     audio.pause();
    audio.currentTime = 0


    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audioUrl]);
  
  return (
    <section className="relative pt-32 pb-20 bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">

          <div className="text-left relative">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-geist text-4xl font-light tracking-tighter text-foreground sm:text-5xl lg:text-6xl mb-6"
            >
              Transform Recruitment with{" "}
              <span className="text-primary">QuickVoice AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg leading-8 text-muted-foreground mb-10"
            >
              Studies show that <strong>85% of recruiters are more likely to stay at their job with the use of conversational AI</strong>.
            </motion.p>

            <Link
              href="/register"
              className="inline-block rounded-full border px-8 py-4"
            >
              Book a Free Demo
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative group"
          >
             <div className="rounded-xl border border-border bg-muted p-4 shadow-xl">
                                     <h3 className="text-sm font-medium text-muted-foreground mb-3">
                                       Live AI Voice Demo
                                     </h3>
                       
                                     {audioUrl ? (
                                       <Player ref={audioRef} src={audioUrl} />
                                     ) : (
                                       <div className="h-16 rounded-md bg-background/50 animate-pulse" />
                                     )}
                                   </div>
                       
                                 <div className="rounded-xl border border-border bg-background shadow-lg">
                                     {audioUrl ? (
                                       <TypingTranscript
                                         audioRef={audioRef}
                                         transcript={hrRecruitingData.transcript as TranscriptLine[]}
                                         isPlaying={isPlaying}
                                       />
                                     ) : (
                                       <div className="p-4 space-y-2">
                                         <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                                         <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                                       </div>
                                     )}
                                   </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
