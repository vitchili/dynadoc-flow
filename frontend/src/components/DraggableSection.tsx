
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Section } from '@/types';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableSectionProps {
  section: Section;
  index: number;
  onEdit: (section: Section) => void;
  onDelete: (sectionId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableSection: React.FC<DraggableSectionProps> = ({
  section,
  index,
  onEdit,
  onDelete,
  onMove
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'section',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset?.y ?? 0) - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'section',
    item: () => {
      return { id: section.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  
  preview(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className={`glass bg-white/5 rounded-lg p-4 border border-white/10 transition-all duration-200 ${
        isDragging ? 'scale-105 shadow-lg' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1">
          <div
            ref={drag}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded transition-colors"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-100">{section.name}</h4>
            {section.description && (
              <p className="text-sm text-gray-400 mt-1">{section.description}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(section)}
            className="hover:bg-white/10"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(section.id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DraggableSection;
