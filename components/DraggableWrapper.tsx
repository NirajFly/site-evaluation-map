'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { Move } from 'lucide-react';

interface DraggableWrapperProps {
    children: ReactNode;
    toggleId: string;
    defaultPosition?: { x: number; y: number };
    className?: string;
}

interface Position {
    x: number | null;
    y: number | null;
}

export default function DraggableWrapper({ 
    children, 
    toggleId, 
    defaultPosition,
    className = ''
}: DraggableWrapperProps) {
    const [position, setPosition] = useState<Position>(() => {
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
    const [showHandle, setShowHandle] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;
            
            setPosition((prev: Position) => ({
                x: (prev.x || 0) + deltaX,
                y: (prev.y || 0) + deltaY
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
            onMouseEnter={() => setShowHandle(true)}
            onMouseLeave={() => !isDragging && setShowHandle(false)}
        >
            {showHandle && (
                <div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white p-1 rounded cursor-grab hover:bg-gray-800 transition-colors"
                    onMouseDown={handleMouseDown}
                    style={{ zIndex: 1000 }}
                >
                    <Move size={14} />
                </div>
            )}
            {children}
        </div>
    );
}