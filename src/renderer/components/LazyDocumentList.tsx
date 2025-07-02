import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  height: 100%;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }
`;

const DocumentItem = styled.div<{ $isSelected?: boolean; $isLoading?: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  background: ${props => props.$isSelected ? 'var(--accent-light)' : 'transparent'};
  opacity: ${props => props.$isLoading ? 0.5 : 1};
  transition: all var(--transition-fast);
  
  &:hover {
    background: ${props => props.$isSelected ? 'var(--accent-light)' : 'var(--bg-hover)'};
  }
`;

const DocumentTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DocumentMeta = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  gap: 16px;
`;

const LoadingIndicator = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
`;

const Skeleton = styled.div<{ $width?: string; $height?: string }>`
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '16px'};
  border-radius: 4px;
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export interface DocumentInfo {
  id: string;
  title: string;
  path?: string;
  preview?: string;
  lastModified?: Date;
  size?: number;
  isLoading?: boolean;
}

interface LazyDocumentListProps {
  documents: DocumentInfo[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onLoadMore?: () => Promise<DocumentInfo[]>;
  pageSize?: number;
  totalCount?: number;
}

const LazyDocumentList: React.FC<LazyDocumentListProps> = ({
  documents,
  selectedId,
  onSelect,
  onLoadMore,
  pageSize = 20,
  totalCount
}) => {
  const [items, setItems] = useState<DocumentInfo[]>(documents.slice(0, pageSize));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(documents.length > pageSize || (totalCount ? items.length < totalCount : false));
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  
  useEffect(() => {
    setItems(documents.slice(0, pageSize));
    setHasMore(documents.length > pageSize || (totalCount ? pageSize < totalCount : false));
  }, [documents, pageSize, totalCount]);
  
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore || loadingRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when scrolled 80% down
    if (scrollPercentage > 0.8) {
      loadMore();
    }
  }, [isLoading, hasMore]);
  
  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      if (onLoadMore) {
        const newDocs = await onLoadMore();
        setItems(prev => [...prev, ...newDocs]);
        setHasMore(newDocs.length === pageSize || (totalCount ? items.length + newDocs.length < totalCount : false));
      } else {
        // Load from existing documents array
        const currentLength = items.length;
        const nextBatch = documents.slice(currentLength, currentLength + pageSize);
        setItems(prev => [...prev, ...nextBatch]);
        setHasMore(currentLength + nextBatch.length < documents.length);
      }
    } catch (error) {
      console.error('Error loading more documents:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [items.length, documents, onLoadMore, pageSize, totalCount]);
  
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  
  const formatDate = (date?: Date): string => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <Container ref={containerRef} onScroll={handleScroll}>
      {items.map((doc, index) => (
        doc.isLoading ? (
          <DocumentItem key={`loading-${index}`} $isLoading>
            <DocumentTitle>
              <Skeleton $width="60%" $height="16px" />
            </DocumentTitle>
            <DocumentMeta>
              <Skeleton $width="30%" $height="12px" />
              <Skeleton $width="20%" $height="12px" />
            </DocumentMeta>
          </DocumentItem>
        ) : (
          <DocumentItem
            key={doc.id}
            $isSelected={doc.id === selectedId}
            onClick={() => onSelect(doc.id)}
          >
            <DocumentTitle>
              {doc.title}
              {doc.path && (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </DocumentTitle>
            <DocumentMeta>
              {doc.lastModified && <span>{formatDate(doc.lastModified)}</span>}
              {doc.size && <span>{formatFileSize(doc.size)}</span>}
              {doc.preview && (
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.preview}
                </span>
              )}
            </DocumentMeta>
          </DocumentItem>
        )
      ))}
      
      {isLoading && (
        <LoadingIndicator>
          Loading more documents...
        </LoadingIndicator>
      )}
      
      {!hasMore && items.length > 0 && (
        <LoadingIndicator>
          All documents loaded ({items.length} total)
        </LoadingIndicator>
      )}
    </Container>
  );
};

export default LazyDocumentList;