import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';

const CommentsPanel = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${props => props.$isOpen ? '0' : '-350px'};
  width: 350px;
  height: 100vh;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  transition: right var(--transition-normal);
  z-index: 150;
  display: flex;
  flex-direction: column;
`;

const CommentsHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
`;

const CommentsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const CommentThread = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
`;

const CommentHighlight = styled.span`
  background: var(--accent-light);
  color: var(--accent-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'SF Mono', monospace;
  display: block;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Comment = styled.div`
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const CommentAuthor = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
`;

const CommentTime = styled.span`
  font-size: 11px;
  color: var(--text-tertiary);
`;

const CommentText = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const CommentInput = styled.div`
  padding: 16px;
  border-top: 1px solid var(--border-color);
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-light);
  }
`;

const CommentActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--bg-hover);
  }
  
  &.primary {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
    
    &:hover {
      background: var(--accent-dark);
    }
  }
`;

const ToggleButton = styled.button<{ $hasComments: boolean }>`
  position: fixed;
  right: 16px;
  bottom: 100px;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-fast);
  z-index: 140;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-xl);
  }
  
  ${props => props.$hasComments && `
    &::after {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: var(--error-color);
      border-radius: 50%;
    }
  `}
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

export interface CommentData {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
  replies?: CommentData[];
}

interface CommentsProps {
  comments: CommentData[];
  onAddComment: (comment: Omit<CommentData, 'id'>) => void;
  onDeleteComment: (id: string) => void;
  currentSelection?: { start: number; end: number; text: string };
}

const Comments: React.FC<CommentsProps> = ({ 
  comments, 
  onAddComment, 
  onDeleteComment,
  currentSelection 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return;
    
    onAddComment({
      text: newComment,
      author: 'You',
      timestamp: new Date(),
      selection: currentSelection
    });
    
    setNewComment('');
    setReplyingTo(null);
  }, [newComment, currentSelection, onAddComment]);
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <>
      <ToggleButton
        $hasComments={comments.length > 0}
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle comments"
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </ToggleButton>
      
      <CommentsPanel $isOpen={isOpen}>
        <CommentsHeader>
          <Title>Comments ({comments.length})</Title>
          <CloseButton onClick={() => setIsOpen(false)}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </CloseButton>
        </CommentsHeader>
        
        <CommentsList>
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
              <p style={{ fontSize: '13px' }}>No comments yet</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                Select text and add a comment to start a discussion
              </p>
            </div>
          ) : (
            comments.map(comment => (
              <CommentThread key={comment.id}>
                {comment.selection && (
                  <CommentHighlight>"{comment.selection.text}"</CommentHighlight>
                )}
                <Comment>
                  <CommentMeta>
                    <CommentAuthor>{comment.author}</CommentAuthor>
                    <CommentTime>{formatTime(comment.timestamp)}</CommentTime>
                  </CommentMeta>
                  <CommentText>{comment.text}</CommentText>
                </Comment>
                {comment.replies?.map(reply => (
                  <Comment key={reply.id} style={{ marginLeft: '20px' }}>
                    <CommentMeta>
                      <CommentAuthor>{reply.author}</CommentAuthor>
                      <CommentTime>{formatTime(reply.timestamp)}</CommentTime>
                    </CommentMeta>
                    <CommentText>{reply.text}</CommentText>
                  </Comment>
                ))}
              </CommentThread>
            ))
          )}
        </CommentsList>
        
        <CommentInput>
          <TextArea
            ref={inputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={currentSelection ? 
              `Comment on "${currentSelection.text.slice(0, 30)}..."` : 
              "Add a comment..."
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleAddComment();
              }
            }}
          />
          <CommentActions>
            <ActionButton onClick={() => setNewComment('')}>Cancel</ActionButton>
            <ActionButton className="primary" onClick={handleAddComment}>
              Add Comment
            </ActionButton>
          </CommentActions>
        </CommentInput>
      </CommentsPanel>
    </>
  );
};

export default Comments;