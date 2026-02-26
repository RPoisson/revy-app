"use client";

import type { RoomLayoutSpec } from "./roomLayouts";

interface RoomSelectorProps {
  rooms: RoomLayoutSpec[];
  selectedRoomId: string;
  onSelect: (roomId: string) => void;
}

export function RoomSelector({ rooms, selectedRoomId, onSelect }: RoomSelectorProps) {
  return (
    <nav className="flex flex-wrap gap-2">
      {rooms.map((room) => {
        const isSelected = selectedRoomId === room.id;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room.id)}
            className={
              isSelected
                ? "flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border bg-black text-white border-black shadow-sm"
                : "flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border border-black/20 bg-white text-black hover:bg-black/5 hover:border-black/30 transition-colors"
            }
          >
            {room.displayName ?? room.name}
          </button>
        );
      })}
    </nav>
  );
}
