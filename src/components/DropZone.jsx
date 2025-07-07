import React from 'react';
import { useDrop } from 'react-dnd';

const DropZone = ({ 
  status, 
  children, 
  onDrop, 
  columnConfig 
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => {
      if (item.status !== status) {
        onDrop(item.task, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const dropZoneStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    minHeight: '400px',
    transition: 'all 0.2s ease',
    ...(isOver && canDrop && {
      border: '1px solid #3b82f6',
      backgroundColor: '#eff6ff',
      transform: 'scale(1.02)',
      boxShadow: '0 8px 25px 0 rgba(59, 130, 246, 0.15)'
    }),
    ...(canDrop && !isOver && {
      border: '1px dashed #d1d5db'
    })
  };

  return (
    <div ref={drop} style={dropZoneStyle}>
      {/* Column Header */}
      <div style={{
        padding: '16px',
        backgroundColor: columnConfig.bgColor,
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...(isOver && canDrop && {
          backgroundColor: '#dbeafe'
        })
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: columnConfig.color,
          margin: 0
        }}>
          {columnConfig.title}
        </h3>
        <span style={{
          fontSize: '12px',
          fontWeight: '500',
          color: columnConfig.color,
          backgroundColor: 'white',
          padding: '4px 8px',
          borderRadius: '12px'
        }}>
          {React.Children.count(children)}
        </span>
      </div>

      {/* Tasks Container */}
      <div style={{
        padding: '12px',
        minHeight: '300px',
        maxHeight: '500px',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {children}
        
        {/* Drop Indicator */}
        {isOver && canDrop && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            bottom: '12px',
            border: '2px dashed #3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #3b82f6',
              fontSize: '14px',
              fontWeight: '500',
              color: '#3b82f6',
              boxShadow: '0 4px 12px 0 rgba(59, 130, 246, 0.15)'
            }}>
              📥 Drop task here to move to {columnConfig.title}
            </div>
          </div>
        )}

        {/* Empty State */}
        {React.Children.count(children) === 0 && !isOver && (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '14px',
            padding: '32px 16px',
            fontStyle: 'italic'
          }}>
            {canDrop ? 'Drop tasks here' : 'No tasks yet'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropZone;