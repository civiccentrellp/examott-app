'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    XSquareIcon,
    Fullscreen,
    Volume2,
    VolumeX,
    Pause,
    Play,
} from 'lucide-react';

interface YouTubePlayerProps {
    videoId: string;
    onClose: () => void;
    isFullscreen: boolean;
    setIsFullscreen: (val: boolean) => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
    videoId,
    onClose,
    isFullscreen,
    setIsFullscreen,
}) => {
    const ytPlayerRef = useRef<YT.Player | null>(null);
    const playerContainerRef = useRef<HTMLDivElement | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [showUnmuteMessage, setShowUnmuteMessage] = useState(true);

    const [volume, setVolume] = useState(100);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [availableQualities, setAvailableQualities] = useState<string[]>([]);
    const [selectedQuality, setSelectedQuality] = useState<string>('default');
    const [selectedSpeed, setSelectedSpeed] = useState<number>(1);

    const [showControls, setShowControls] = useState(true);
    const hideTimer = useRef<NodeJS.Timeout | null>(null);

    const resetControlsTimer = () => {
        setShowControls(true);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setShowControls(false), 2500);
    };

    useEffect(() => {
        window.addEventListener("mousemove", resetControlsTimer);
        window.addEventListener("touchstart", resetControlsTimer);
        resetControlsTimer();
        return () => {
            window.removeEventListener("mousemove", resetControlsTimer);
            window.removeEventListener("touchstart", resetControlsTimer);
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, []);


    useEffect(() => {
        const loadPlayer = () => {
            if (!playerContainerRef.current) return;

            ytPlayerRef.current = new window.YT.Player(playerContainerRef.current, {
                videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    mute: 1,
                    modestbranding: 1,
                    rel: 0,
                    fs: 0,
                },
                events: {
                    onReady: (event: YT.PlayerEvent) => {
                        setDuration(event.target.getDuration());
                        setIsPlaying(true);

                        // fetch available quality levels
                        setTimeout(() => {
                            const levels = event.target.getAvailableQualityLevels?.() || [];
                            if (levels.length > 0) setAvailableQualities(levels);
                        }, 500);

                        // track time
                        intervalRef.current = setInterval(() => {
                            if (ytPlayerRef.current?.getCurrentTime) {
                                setCurrentTime(ytPlayerRef.current.getCurrentTime());
                            }
                        }, 1000);
                    },
                },
            });
        };

        if (!window.YT || !window.YT.Player) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.body.appendChild(tag);
            (window as any).onYouTubeIframeAPIReady = loadPlayer;
        } else {
            loadPlayer();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            ytPlayerRef.current?.destroy();
        };
    }, [videoId]);

    const togglePlay = () => {
        if (!ytPlayerRef.current || typeof ytPlayerRef.current.pauseVideo !== 'function') return;
        if (isPlaying) ytPlayerRef.current.pauseVideo();
        else ytPlayerRef.current.playVideo();
        setIsPlaying(!isPlaying);
    };

    // const toggleMute = () => {
    //     if (!ytPlayerRef.current) return;
    //     if (isMuted) ytPlayerRef.current.unMute();
    //     else ytPlayerRef.current.mute();
    //     setIsMuted(!isMuted);
    // };

    const toggleMute = () => {
        if (!ytPlayerRef.current) return;
        if (isMuted) {
            ytPlayerRef.current.unMute();
            setIsMuted(false);
            setShowUnmuteMessage(false);   // hide message
        } else {
            ytPlayerRef.current.mute();
            setIsMuted(true);
        }
    };


    const setPlaybackSpeed = (speed: number) => {
        ytPlayerRef.current?.setPlaybackRate(speed);
        setSelectedSpeed(speed);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        if (!ytPlayerRef.current) return;
        ytPlayerRef.current.setVolume(newVolume);
        if (newVolume === 0) {
            ytPlayerRef.current.mute();
            setIsMuted(true);
        } else {
            ytPlayerRef.current.unMute();
            setIsMuted(false);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        ytPlayerRef.current?.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const quality = e.target.value as YT.SuggestedVideoQuality;
        ytPlayerRef.current?.setPlaybackQuality(quality);
        setSelectedQuality(quality);
    };

    const handleFullScreenClick = async () => {
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);

        if (!isFullscreen) {
            setIsFullscreen(true);

            if (isMobile && screen.orientation?.lock) {
                try {
                    await screen.orientation.lock("landscape");
                } catch (err) {
                    console.warn("Orientation lock failed", err);
                }
            }
        } else {
            setIsFullscreen(false);

            if (isMobile && screen.orientation?.unlock) {
                try {
                    await screen.orientation.unlock();
                } catch (err) {
                    console.warn("Orientation unlock failed", err);
                }
            }
        }
    };


    return (
        <div
            className={`bg-black rounded-md overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full relative'
                }`}
        >
            <div ref={playerContainerRef} className="w-full h-full" />
            <div className="absolute inset-0 z-20" onContextMenu={(e) => e.preventDefault()} />

            {/* Controls */}
            {/* <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/80 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
                <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="hover:scale-110 transition">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button onClick={toggleMute} className="hover:scale-110 transition">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 accent-red-600"
                    />
                    <span className="text-xs text-gray-300">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>

                <div className="flex-1">
                    <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full accent-red-600"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="bg-black text-white border border-white rounded px-2 py-1 text-xs"
                    >
                        <option value="0.25">0.25x</option>
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x (Normal)</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>

                    {availableQualities.length > 0 && (
                        <select
                            value={selectedQuality}
                            onChange={handleQualityChange}
                            className="bg-black text-white border border-white rounded px-2 py-1 text-xs"
                        >
                            {[
                                { label: "Auto", value: "default" },
                                { label: "Low (240p)", value: "small" },
                                { label: "Medium (360p)", value: "medium" },
                                { label: "Better (720p)", value: "hd720" },
                                { label: "Best (1080p)", value: "hd1080" },
                            ]
                                .filter(
                                    (option) =>
                                        option.value === "default" || availableQualities.includes(option.value)
                                )
                                .map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                        </select>
                    )}

                    <button
                        // onClick={() => setIsFullscreen(!isFullscreen)}
                        onClick={handleFullScreenClick}
                        className="hover:scale-110 transition"
                    >
                        <Fullscreen size={20} />
                    </button>
                </div>
            </div> */}
            {showUnmuteMessage && (
                <div
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 
               bg-black/70 text-white px-3 py-2 rounded-md 
               text-sm md:text-base z-40 animate-pulse cursor-pointer"
                    onClick={toggleMute}
                >
                    Tap to unmute
                </div>
            )}


            {/* Control Panel */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-30 
              bg-gradient-to-t from-black/80 via-black/40 to-transparent 
              text-white transition-opacity duration-500 
              ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"} 
              px-2 py-1 md:px-4 md:py-2 text-[10px] md:text-sm select-none`}
            >
                {/* Seek bar */}
                <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full accent-red-600 mb-0.5"
                />

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                    {/* Left Controls */}
                    <div className="flex items-center gap-1.5 md:gap-3">
                        <button onClick={togglePlay} className="p-1 rounded-full hover:bg-white/20 transition">
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>

                        <button onClick={toggleMute} className="p-1 rounded-full hover:bg-white/20 transition">
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>

                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-16 md:w-24 accent-red-600"
                        />

                        <span className="text-[9px] md:text-xs text-gray-300">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-1.5 md:gap-3">
                        <select
                            value={selectedSpeed}
                            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                            className="bg-black/50 text-white border border-white/30 rounded px-1 py-0.5 text-[9px] md:text-xs"
                        >
                            <option value="0.25">0.25x</option>
                            <option value="0.5">0.5x</option>
                            <option value="0.75">0.75x</option>
                            <option value="1">1x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2x</option>
                        </select>

                        {availableQualities.length > 0 && (
                            <select
                                value={selectedQuality}
                                onChange={handleQualityChange}
                                className="bg-black/50 text-white border border-white/30 rounded px-1 py-0.5 text-[9px] md:text-xs"
                            >
                                {[
                                    { label: "Auto", value: "default" },
                                    { label: "Low (240p)", value: "small" },
                                    { label: "Medium (360p)", value: "medium" },
                                    { label: "Better (720p)", value: "hd720" },
                                    { label: "Best (1080p)", value: "hd1080" },
                                ]
                                    .filter((o) => o.value === "default" || availableQualities.includes(o.value))
                                    .map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                            </select>
                        )}

                        <button onClick={handleFullScreenClick} className="p-1 rounded-full hover:bg-white/20 transition">
                            <Fullscreen size={16} />
                        </button>
                    </div>
                </div>
            </div>




            <button
                className="absolute top-4 right-4 text-white text-lg bg-red-600 hover:bg-red-700 p-1 rounded z-40"
                onClick={onClose}
            >
                <XSquareIcon size={16} />
            </button>
        </div>
    );
};

function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const hrsStr = hrs > 0 ? `${hrs}:` : '';
    const minsStr = hrs > 0 ? String(mins).padStart(2, '0') : String(mins);
    const secsStr = String(secs).padStart(2, '0');

    return `${hrsStr}${minsStr}:${secsStr}`;
}
