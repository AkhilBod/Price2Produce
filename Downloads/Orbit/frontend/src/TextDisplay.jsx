import React, { useState, useEffect, useRef } from 'react';
import useTextDisplayData from './useTextDisplayData';
import DraggableCard from './DraggableCard';
import { X, Trash2 } from 'lucide-react';

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    padding: '20px',
    overflowY: 'auto',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '8px',
    padding: '8px',
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  card: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '8px',
    padding: '0',
    overflow: 'hidden',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#1a1a1a',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  textContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '12px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    color: 'white',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  loading: {
    padding: '16px',
    color: '#ffffff',
    textAlign: 'center',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
    zIndex: 2000,
    overflow: 'auto',
  },
  modalHeader: {
    padding: '16px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalContent: {
    padding: '20px',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1999,
  },
  deleteButton: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    padding: '8px',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderRadius: '50%',
    cursor: 'pointer',
    opacity: 0,
    transition: 'all 0.2s ease-in-out',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    '&:hover': {
      backgroundColor: 'rgba(255, 59, 48, 1)',
      transform: 'scale(1.1)',
    },
  },
  cardWrapper: {
    position: 'relative',
    '&:hover .delete-button': {
      opacity: 1,
    },
  },
  errorMessage: {
    color: '#ff3b30',
    padding: '16px',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: '8px',
    margin: '16px',
  },
};

const TextDisplay = ({ initialItems = [], isSearchMode = false }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const observerRef = useRef();
  const loadingRef = useRef(null);

  const { 
    items, 
    page, 
    totalCount, 
    loading, 
    error, 
    fetchPage,
    removeItem, // Add this to your useTextDisplayData hook
  } = useTextDisplayData(1, 20);

  const displayItems = isSearchMode ? initialItems : items;

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    
    if (deleteInProgress) return;
    
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setDeleteInProgress(true);

    try {
      const contentType = item.type.toLowerCase();
      const response = await fetch(
        `http://localhost:3030/api/delete/${contentType}/${item.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      if (isSearchMode) {
        // Remove item from search results
        const updatedItems = initialItems.filter(i => i.id !== item.id);
        // You'll need to implement a way to update initialItems in the parent component
      } else {
        // Remove item from the items state
        removeItem(item.id);
      }

      // Close modal if the deleted item was being viewed
      if (selectedItem?.id === item.id) {
        closeModal();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setDeleteInProgress(false);
    }
  };

  const renderContent = (item) => {
    const isImage = item.type === 'image' || (item.metadata && item.metadata.type === 'image');
    const isYouTube = item.metadata?.type === 'youtube_video';
    
    return (
      <div style={styles.imageContainer}>
        {isImage ? (
          <img 
            src={item.data || '/api/placeholder/400/400'} 
            alt={item.metadata?.title || 'Image'} 
            style={styles.image}
          />
        ) : isYouTube ? (
          <div style={{
            ...styles.image,
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}>
            <span style={{ fontSize: '14px', color: '#fff' }}>
              {item.document}
            </span>
          </div>
        ) : (
          <div style={{
            ...styles.image,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}>
            <span style={{ fontSize: '14px', color: '#333' }}>
              {(item.document || '').substring(0, 100)}...
            </span>
          </div>
        )}
        <div style={styles.textContent}>
          {item.metadata?.title && (
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
              {item.metadata.title}
            </div>
          )}
          {item.metadata?.timestamp && (
            <div style={{ fontSize: '12px', opacity: '0.8' }}>
              {new Date(item.metadata.timestamp).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && items.length < totalCount) {
          fetchPage(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, items.length, totalCount, page, fetchPage]);

  useEffect(() => {
    if (!isSearchMode) {
      fetchPage(1);
    }
  }, [fetchPage, isSearchMode]);

  if (error) {
    return <div style={styles.errorMessage}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.gridContainer}>
        {displayItems.map((item, index) => (
          <div 
            key={item.id || index}
            style={styles.cardWrapper}
            onClick={() => handleItemClick(item)}
          >
            <button
              className="delete-button"
              style={styles.deleteButton}
              onClick={(e) => handleDelete(e, item)}
              disabled={deleteInProgress}
              title="Delete item"
            >
              <Trash2 size={16} color="white" />
            </button>
            {renderContent(item)}
          </div>
        ))}
      </div>

      {!isSearchMode && (
        <div ref={loadingRef} style={styles.loading}>
          {loading ? 'Loading more items...' : ''}
        </div>
      )}

      {showModal && selectedItem && (
        <>
          <div style={styles.modalOverlay} onClick={closeModal} />
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>{selectedItem.metadata?.title || 'Item Details'}</h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <div style={styles.modalContent}>
              {selectedItem.type === 'image' ? (
                <img 
                  src={selectedItem.data} 
                  alt={selectedItem.metadata?.title || 'Image'}
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              ) : (
                <div style={{ color: '#333' }}>{selectedItem.document}</div>
              )}
              {selectedItem.metadata?.timestamp && (
                <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                  {new Date(selectedItem.metadata.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TextDisplay;