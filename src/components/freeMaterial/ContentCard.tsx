'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Youtube, PlayCircle, Trash, Pencil, Download, ExternalLink, VideoIcon } from 'lucide-react';
import PDFViewer from '../ui/PDFViewer';
import { YouTubePlayer } from '../ui/YouTubePlayer';
import { useRouter } from 'next/navigation';
import { FiletypePdf, XSquareFill } from 'react-bootstrap-icons';
import IconButtonWithTooltip from '../ui/IconButtonWithTooltip';
import VisibilityCheck from '../VisibilityCheck';
import { useUser } from '@/context/userContext';

type ContentType = 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'TEST';

interface ContentCardProps {
  id: string;
  title: string;
  type: ContentType;
  url: string;
  testId?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  type,
  url,
  testId,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();
  const { user } = useUser();
  const [showPreview, setShowPreview] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);


  const renderIcon = () => {
    switch (type) {
      case 'DOCUMENT':
      case 'IMAGE':
        return <FiletypePdf size={18} />;
      case 'VIDEO':
        return <VideoIcon size={18} />;
      case 'TEST':
        return <PlayCircle size={18} />;
      default:
        return null;
    }
  };

  const downloadFile = () => {
    const downloadUrl = url.includes('response-content-disposition')
      ? url
      : `${url}${url.includes('?') ? '&' : '?'}response-content-disposition=attachment`;

    // Open in new tab - works better on mobile
    window.open(downloadUrl, '_blank');
  };

  const handleClick = () => {
    if (type === 'DOCUMENT' || type === 'IMAGE' || type === 'VIDEO') {
      setShowPreview(true);
    } else if (type === 'TEST') {
      // router.push(`/dbms/test-form?id=${testId}`);
      router.push(`/tests/${testId}?from=free-material`);
    }
  };

  return (
    <div className="border-b py-3 px-4 bg-white cursor-pointer">
      <div className="flex items-center justify-between gap-2" onClick={handleClick}>
        <div className="flex items-center gap-4 font-medium text-xs">
          {renderIcon()}
          {title}
        </div>
        <div
          className="flex gap-2 flex-wrap justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          {(type === 'DOCUMENT' || type === 'IMAGE') && (
            <IconButtonWithTooltip
              label="Download"
              icon={<Download size={16} />}
              onClick={downloadFile}
            />
          )}
          <VisibilityCheck user={user} check="content.update" checkType="permission">
            {/* {onEdit && (
              <IconButtonWithTooltip
                label="Edit"
                icon={<Pencil size={16} />}
                onClick={(e) => {
                  e.stopPropagation(); // prevent preview click
                  onEdit(); // open modal
                }}
              />
            )} */}

            {onEdit && (
              <IconButtonWithTooltip
                label="Edit"
                icon={<Pencil size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (type === 'TEST' && testId) {
                    router.push(`/dbms/test-form?id=${testId}&from=free-material`);
                  } else {
                    onEdit();
                  }
                }}
              />
            )}
          </VisibilityCheck>
          <VisibilityCheck user={user} check="content.delete" checkType="permission">
            {onDelete && (
              <IconButtonWithTooltip
                label="Delete"
                icon={<Trash size={16} />}
                onClick={onDelete}
              />
            )}
          </VisibilityCheck>

        </div>
      </div>

      {/* PDF or Image Viewer */}
      {showPreview && (type === 'DOCUMENT' || type === 'IMAGE') && (
        <div className="fixed inset-0 z-50 m-0 bg-black/70 flex items-center justify-center">
          <div className="relative bg-black/70 p-4 rounded shadow h-full w-full">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-2 right-2 text-white cursor-pointer "
            >
              <XSquareFill size={35} />
            </button>
            {url.toLowerCase().includes('.pdf') ? (
              <PDFViewer url={url} />
            ) : (
              <img
                src={url}
                alt={title}
                className="h-full w-full object-contain"
                onContextMenu={(e) => e.preventDefault()}
              />
            )}
          </div>
        </div>
      )
      }

      {/* YouTube Modal */}
      {
        showPreview && type === 'VIDEO' && (
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
                videoId={extractYouTubeId(url)}
                onClose={() => setShowPreview(false)}
                isFullscreen={fullscreen}
                setIsFullscreen={setFullscreen}
              />
            </div>
          </div>
        )
      }
    </div >
  );
};

// Utility to extract video ID from YouTube URL
const extractYouTubeId = (url: string): string => {
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&]+)/;
  const match = url.match(regExp);
  return match?.[1] ?? '';
};

export default ContentCard;
