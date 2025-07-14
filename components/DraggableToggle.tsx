'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { Move } from 'lucide-react';

interface DraggableToggleProps {
    children: ReactNode;
    toggleId: string;
    defaultPosition?: { x: number; y: number };
    className?: string;
}

export default function DraggableToggle({ 
    children, 
    toggleId, 
    defaultPosition,
    className = ''
}: DraggableToggleProps) {
    const [position, setPosition] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`toggle-position-${toggleId}`);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    // Invalid JSON, use default
                }
            }
        }
        return defaultPosition || { x: null, y: null };
    });
    
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;
            
            setPosition((prev: { x: number; y: number }) => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY
            }));
            
            setDragStart({ x: e.clientX, y: e.clientY });
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                // Save position to localStorage
                if (position.x !== null && position.y !== null) {
                    localStorage.setItem(`toggle-position-${toggleId}`, JSON.stringify(position));
                }
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'auto';
        };
    }, [isDragging, dragStart, position, toggleId]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        
        // Initialize position if not set
        if (position.x === null || position.y === null) {
            const rect = elementRef.current?.getBoundingClientRect();
            if (rect) {
                setPosition({ x: rect.left, y: rect.top });
            }
        }
    };

    const style = position.x !== null && position.y !== null 
        ? { 
            position: 'fixed' as const, 
            left: position.x, 
            top: position.y,
            zIndex: isDragging ? 9999 : undefined
        } 
        : undefined;

    return (
        <div 
            ref={elementRef}
            className={`${className} ${isDragging ? 'opacity-90' : ''}`}
            style={style}
        >
            <div className="relative">
                <div className="absolute -right-2 -top-2 z-50">
                    <button
                        className="bg-gray-600 text-white p-1 rounded hover:bg-gray-700 transition-colors cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                        title="Drag to move"
                    >
                        <Move size={12} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}