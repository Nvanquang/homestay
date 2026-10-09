"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  UploadCloud,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Image as ImageIcon,
  AlertCircle,
  Undo2,
  Check,
} from "lucide-react";
import { ListingPhotoItem } from "../types";

export interface SortablePhotoGridProps {
  photos: ListingPhotoItem[];
  onUpload: (files: FileList | File[]) => void;
  onReorder: (newPhotos: ListingPhotoItem[]) => void;
  onDeletePhoto: (photoId: string) => void;
  onUpdateCaption?: (photoId: string, caption: string) => void;
  minRequired?: number;
  maxAllowed?: number;
  className?: string;
}

interface SortablePhotoCardProps {
  photo: ListingPhotoItem;
  index: number;
  total: number;
  onSetCover: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDelete: () => void;
  onUpdateCaption?: (caption: string) => void;
}

function SortablePhotoCard({
  photo,
  index,
  total,
  onSetCover,
  onMoveLeft,
  onMoveRight,
  onDelete,
  onUpdateCaption,
}: SortablePhotoCardProps) {
  const t = useTranslations("listingWizard");
  const isCover = index === 0;
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState(photo.caption || "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 1,
  };

  const handleSaveCaption = () => {
    setIsEditingCaption(false);
    if (onUpdateCaption) {
      onUpdateCaption(captionText);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`photo-item-${photo.id}`}
      className={`group relative rounded-xl overflow-hidden border bg-[var(--color-bg-surface)] shadow-xs transition-shadow flex flex-col ${
        isDragging
          ? "opacity-50 ring-2 ring-[var(--color-primary)] shadow-lg"
          : "hover:shadow-md border-[var(--color-border-subtle)]"
      }`}
    >
      {/* Photo Media Aspect Box */}
      <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={photo.url}
          alt={photo.caption || `Photo ${index + 1}`}
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
          loading="lazy"
        />

        {/* Drag handle button overlay */}
        <div
          {...attributes}
          {...listeners}
          title="Drag to reorder"
          className="absolute top-2 left-2 p-1.5 rounded-md bg-black/60 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-black/80"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Cover badge */}
        {isCover && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold shadow-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" />
            <span>{t("coverBadge")}</span>
          </div>
        )}

        {/* Photo index indicator */}
        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs">
          #{index + 1}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="p-2.5 bg-[var(--color-bg-surface)] flex flex-col gap-1.5 border-t border-[var(--color-border-subtle)]">
        {/* Caption */}
        {isEditingCaption ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              placeholder="Caption..."
              maxLength={120}
              autoFocus
              className="w-full text-xs px-2 py-1 border rounded border-[var(--color-border-subtle)] bg-[var(--color-bg-page)]"
              onKeyDown={(e) => e.key === "Enter" && handleSaveCaption()}
            />
            <button
              type="button"
              onClick={handleSaveCaption}
              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
              title="Save caption"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingCaption(true)}
            title="Click to edit caption"
            className="text-[11px] text-[var(--color-text-secondary)] truncate cursor-pointer hover:text-[var(--color-primary)]"
          >
            {photo.caption || "Caption..."}
          </div>
        )}

        {/* Navigation & Action Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border-subtle)]/50">
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={index === 0}
              onClick={onMoveLeft}
              title="Move left"
              className="p-1 rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={onMoveRight}
              title="Move right"
              className="p-1 rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {!isCover && (
              <button
                type="button"
                onClick={onSetCover}
                title={t("setCover")}
                className="text-[11px] font-medium text-[var(--color-primary)] hover:underline flex items-center gap-0.5 px-1 py-0.5 rounded cursor-pointer"
              >
                <Star className="w-3 h-3" />
                <span>{t("setCover")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              title="Delete photo"
              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SortablePhotoGrid({
  photos,
  onUpload,
  onReorder,
  onDeletePhoto,
  onUpdateCaption,
  minRequired = 5,
  maxAllowed = 30,
  className = "",
}: SortablePhotoGridProps) {
  const t = useTranslations("listingWizard");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOverDropzone, setDragOverDropzone] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Undo deletion mechanism (5-second grace window per S05 AC)
  const [pendingDeletion, setPendingDeletion] = useState<{
    photo: ListingPhotoItem;
    timeoutId: NodeJS.Timeout;
    countdown: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((item) => item.id === active.id);
      const newIndex = photos.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(photos, oldIndex, newIndex).map(
        (item, idx) => ({
          ...item,
          order: idx,
        })
      );
      onReorder(reordered);
    }
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= photos.length) return;
    const reordered = arrayMove(photos, fromIndex, toIndex).map(
      (item, idx) => ({
        ...item,
        order: idx,
      })
    );
    onReorder(reordered);
  };

  const handleSetCover = (targetId: string) => {
    const targetIdx = photos.findIndex((p) => p.id === targetId);
    if (targetIdx > 0) {
      handleMove(targetIdx, 0);
    }
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorBanner(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        setErrorBanner(`"${file.name}" > 10MB.`);
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setErrorBanner(`"${file.name}" JPG/PNG/WebP only.`);
        return;
      }
      validFiles.push(file);
    }

    if (photos.length + validFiles.length > maxAllowed) {
      setErrorBanner(`Max ${maxAllowed} photos allowed.`);
      return;
    }

    onUpload(validFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInitiateDelete = (photo: ListingPhotoItem) => {
    if (pendingDeletion) {
      clearTimeout(pendingDeletion.timeoutId);
      onDeletePhoto(pendingDeletion.photo.id);
    }

    const tId = setTimeout(() => {
      onDeletePhoto(photo.id);
      setPendingDeletion(null);
    }, 5000);

    setPendingDeletion({
      photo,
      timeoutId: tId,
      countdown: 5,
    });
  };

  const handleUndoDelete = () => {
    if (pendingDeletion) {
      clearTimeout(pendingDeletion.timeoutId);
      setPendingDeletion(null);
    }
  };

  const displayPhotos = pendingDeletion
    ? photos.filter((p) => p.id !== pendingDeletion.photo.id)
    : photos;

  const isSatisfiedMin = displayPhotos.length >= minRequired;

  return (
    <div
      data-testid="sortable-photo-grid"
      className={`space-y-4 ${className}`}
    >
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverDropzone(true);
        }}
        onDragLeave={() => setDragOverDropzone(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverDropzone(false);
          handleFilesSelected(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          dragOverDropzone
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 scale-[1.005]"
            : "border-[var(--color-border-subtle)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-subtle)]"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold text-[var(--color-text-primary)]">
          {t("photoDropzoneTitle")}
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)] max-w-sm">
          {t("photoDropzoneSub")}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
      </div>

      {/* Error banner if any */}
      {errorBanner && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* 5-second Undo Bar (S05 AC) */}
      {pendingDeletion && (
        <div className="p-3 rounded-xl bg-amber-500 text-slate-900 font-medium text-xs flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>
              {t("undoDeleteNotice", {
                title: pendingDeletion.photo.caption || "Photo",
              })}
            </span>
          </div>
          <button
            type="button"
            onClick={handleUndoDelete}
            className="px-3 py-1 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>{t("undoDelete")}</span>
          </button>
        </div>
      )}

      {/* Progress & counter */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--color-text-primary)]">
            {t("photoCount", {
              count: displayPhotos.length,
              max: maxAllowed,
            })}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full font-medium ${
              isSatisfiedMin
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
            }`}
          >
            {isSatisfiedMin
              ? t("minRequirementMet")
              : t("minRequirementMissing", {
                  count: minRequired - displayPhotos.length,
                })}
          </span>
        </div>

        <span className="text-[var(--color-text-tertiary)] italic">
          {t("firstPhotoIsCover")}
        </span>
      </div>

      {/* Photo Grid */}
      {displayPhotos.length === 0 ? (
        <div className="py-12 border border-[var(--color-border-subtle)] rounded-xl bg-[var(--color-bg-subtle)]/40 text-center flex flex-col items-center justify-center gap-2">
          <ImageIcon className="w-8 h-8 text-[var(--color-text-tertiary)]" />
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            No photos uploaded yet
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayPhotos.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {displayPhotos.map((photo, index) => (
                <SortablePhotoCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  total={displayPhotos.length}
                  onSetCover={() => handleSetCover(photo.id)}
                  onMoveLeft={() => handleMove(index, index - 1)}
                  onMoveRight={() => handleMove(index, index + 1)}
                  onDelete={() => handleInitiateDelete(photo)}
                  onUpdateCaption={(cap) =>
                    onUpdateCaption && onUpdateCaption(photo.id, cap)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
