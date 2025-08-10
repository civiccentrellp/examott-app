'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MoreVertical, VideoIcon, FolderIcon, XSquareIcon, Fullscreen, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import {
  VideoFolder,
  getVideoFolders,
  getAllVideoFolders,
  addVideoFolder,
  updateVideoFolder,
  deleteVideoFolder
} from '@/utils/dbms/videoFolder';
import {
  Video,
  getVideosByFolder,
  addVideo,
  updateVideo,
  deleteVideo
} from '@/utils/dbms/video';
import { YouTubePlayer } from '../ui/YouTubePlayer';
import { FilterCircle } from 'react-bootstrap-icons';

export default function VideosPanel({
  selectedCourse,
  setSelectedCourse,
}: {
  selectedCourse: string | null;
  setSelectedCourse: (value: string | null) => void;
}) {

  const [folders, setFolders] = useState<VideoFolder[]>([]);
  const [videosByFolder, setVideosByFolder] = useState<Record<string, Video[]>>({});
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadingTo, setUploadingTo] = useState<string | null>(null);

  // unified fetch
  const fetchFolders = useCallback(async () => {
    try {
      const data = selectedCourse
        ? await getVideoFolders(selectedCourse)
        : await getAllVideoFolders();
      setFolders(data);
      setSelectedFolderId(null);
      setActiveVideoUrl(null);
      setIsFullscreenMode(false);
      setVideosByFolder({});
    } catch (error) {
      console.error(error);
      toast.error('Error fetching folders');
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const loadVideos = async (folderId: string, force = false) => {
    if (force || !videosByFolder[folderId]) {
      try {
        const vids = await getVideosByFolder(folderId);
        setVideosByFolder(prev => ({ ...prev, [folderId]: vids }));
      } catch (err) {
        console.error(err);
        toast.error('Error loading videos');
      }
    }
  };

  const handleFolderClick = (folderId: string) => {
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
      setActiveVideoUrl(null);
      setIsFullscreenMode(false);
    } else {
      setSelectedFolderId(folderId);
      setActiveVideoUrl(null);
      setIsFullscreenMode(false);
      loadVideos(folderId);
    }
  };

  // -- Edit/Delete Handlers for Folders --

  const handleEditFolder = async (folder: VideoFolder) => {
    const newName = prompt('New folder name:', folder.name);
    if (!newName?.trim()) return;
    try {
      await updateVideoFolder(folder.id, { name: newName.trim() });
      toast.success('Folder updated');
      await fetchFolders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update folder');
    }
  };

  const handleDeleteFolder = async (folder: VideoFolder) => {
    if (!confirm(`Delete folder "${folder.name}" and all its videos?`)) return;
    try {
      await deleteVideoFolder(folder.id);
      toast.success('Folder deleted');
      await fetchFolders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete folder');
    }
  };

  // -- Edit/Delete Handlers for Videos --

  const handleEditVideo = async (video: Video) => {
    const newTitle = prompt('New video title:', video.title);
    if (!newTitle?.trim()) return;
    const newUrl = prompt('New YouTube URL:', video.url);
    if (!newUrl?.trim()) return;

    try {
      await updateVideo(video.id, { title: newTitle.trim(), url: newUrl.trim() });
      toast.success('Video updated');
      // ← here: re-load the folder’s videos, forcing a refresh
      await loadVideos(video.folderId, true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update video');
    }
  };


  const handleDeleteVideo = async (video: Video) => {
    if (!confirm(`Delete video "${video.title}"?`)) return;
    try {
      await deleteVideo(video.id);
      toast.success('Video deleted');
      if (video.folderId) await loadVideos(video.folderId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete video');
    }
  };

  const handleVideoUpload = async () => {
    if (!uploadingTo || !uploadTitle.trim() || !uploadUrl.trim()) {
      toast.error('Fill all fields');
      return;
    }
    try {
      await addVideo({ folderId: uploadingTo, title: uploadTitle, url: uploadUrl });
      await loadVideos(uploadingTo);
      toast.success('Video uploaded');
      setUploadTitle('');
      setUploadUrl('');
      setUploadingTo(null);
      setIsUploadModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    }
  };

  // Utility for embed
  const getEmbedUrl = (url: string) => {
    try {
      const vidParam = new URL(url).searchParams.get('v');
      const id = vidParam ?? url.match(/youtu\.be\/([\w-]+)/)?.[1];
      return id ? `https://www.youtube.com/embed/${id}` : '';
    } catch {
      return '';
    }
  };

  const handleVideoClick = (url: string) => {

    setActiveVideoUrl(url);
    setIsFullscreenMode(false);

  };

  function extractYouTubeIdFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const vParam = parsedUrl.searchParams.get('v');
      if (vParam) return vParam;

      // Handles shortened URL format: youtu.be/<videoId>
      const match = url.match(/youtu\.be\/([\w-]+)/);
      return match?.[1] ?? '';
    } catch {
      return '';
    }
  }



  return (
    <div className="p-4">
      <div className='flex items-center justify-between mb-4'>
        <h2 className="text-xl font-semibold">Video Folders</h2>
        {selectedCourse && (
          <Button
            variant="ghost"
            onClick={() => setSelectedCourse(null)}
            className="text-sm flex items-center gap-1"
          >
            <FilterCircle size={16} /> Clear
          </Button>
        )}
      </div>
      <div className="space-y-4 w-full">
        {folders.map(folder => (
          <div key={folder.id} className="border rounded-md bg-gray-50 w-full">
            <div
              className="px-3 py-2 flex justify-between items-center cursor-pointer w-full"
              onClick={() => handleFolderClick(folder.id)}
            >
              <span className="flex items-center font-medium text-md gap-3">
                <FolderIcon /> {folder.name}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => { setUploadingTo(folder.id); setIsUploadModalOpen(true); }}>
                    Upload Video
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleEditFolder(folder)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleDeleteFolder(folder)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {selectedFolderId === folder.id && (
              <div className="px-4 pb-4 space-y-2">
                {(videosByFolder[folder.id]?.length ?? 0) > 0 ? (
                  videosByFolder[folder.id].map(video => (
                    <div
                      key={video.id}
                      className="cursor-pointer bg-gray-100 px-4 py-2 hover:bg-gray-200 rounded flex justify-between"
                      onClick={() => handleVideoClick(video.url)}
                    >
                      <span className="flex items-center gap-3">
                        <VideoIcon /> {video.title}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleEditVideo(video)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDeleteVideo(video)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No videos found</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold">Upload Video</h3>
            <Input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Title" />
            <Input value={uploadUrl} onChange={e => setUploadUrl(e.target.value)} placeholder="YouTube URL" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
              <Button onClick={handleVideoUpload}>Upload</Button>
            </div>
          </div>
        </div>
      )}

      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            className="relative rounded-xl overflow-hidden shadow-2xl bg-black"
            style={{
              width: isFullscreenMode ? '100vw' : '80vw',    // perfect modal width
              height: isFullscreenMode ? '100vh' : '45vw',   // 16:9 ratio
              maxWidth: isFullscreenMode ? '100%' : '960px', // desktop limit
              maxHeight: isFullscreenMode ? '100%' : '540px' // desktop limit
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <YouTubePlayer
              videoId={extractYouTubeIdFromUrl(activeVideoUrl)}
              onClose={() => setActiveVideoUrl(null)}
              isFullscreen={isFullscreenMode}
              setIsFullscreen={setIsFullscreenMode}
            />
          </div>
        </div>
      )}

    </div>
  );
}

