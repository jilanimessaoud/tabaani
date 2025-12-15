import React, { useState } from 'react';
import { Button, Card, Form, Row, Col, Image, Badge, Alert, Tabs, Tab } from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';
import { useLanguage } from '../context/LanguageContext';

const DraggableBlock = ({ block, index, moveBlock, updateBlock, removeBlock, availableImages, availableVideos, onFileUpload }) => {
  const { t } = useLanguage();
  const [{ isDragging }, drag] = useDrag({
    type: 'contentBlock',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'contentBlock',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveBlock(draggedItem.index, index);
        draggedItem.index = index;
      }
    }
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        marginBottom: '1rem'
      }}
    >
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>
            <Badge bg="secondary">#{index + 1}</Badge>
            <strong className="ms-2">{block.type === 'text' ? t('text') : block.type === 'image' ? t('image') : t('video')}</strong>
          </span>
          <div>
            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => removeBlock(index)}>
              {t('remove')}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {block.type === 'text' && (
            <Form.Control
              as="textarea"
              rows={4}
              value={block.content || ''}
              onChange={(e) => updateBlock(index, { ...block, content: e.target.value })}
              placeholder={t('enterTextContent')}
            />
          )}
          {block.type === 'image' && (
            <div>
              <Tabs defaultActiveKey={block.imageSource || 'url'} className="mb-3" onSelect={(k) => updateBlock(index, { ...block, imageSource: k, mediaUrl: '', uploadedFile: null })}>
                <Tab eventKey="url" title="Via URL">
                  <Form.Control
                    type="url"
                    value={block.mediaUrl || ''}
                    onChange={(e) => updateBlock(index, { ...block, mediaUrl: e.target.value, uploadedFile: null })}
                    placeholder={t('enterImageUrl')}
                    className="mb-2"
                  />
                  {block.mediaUrl && (
                    <div className="mt-2">
                      <Image
                        src={block.mediaUrl}
                        thumbnail
                        style={{ maxHeight: '200px' }}
                        alt="Selected image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none', color: 'red', fontSize: '0.875rem' }}>
                        {t('cannotLoadImage')}
                      </div>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="mt-1 d-block"
                        onClick={() => updateBlock(index, { ...block, mediaUrl: '', uploadedFile: null })}
                      >
                        {t('removeImage')}
                      </Button>
                    </div>
                  )}
                </Tab>
                <Tab eventKey="upload" title={t('uploadFromDevice')}>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Create preview URL
                        const previewUrl = URL.createObjectURL(file);
                        updateBlock(index, { 
                          ...block, 
                          uploadedFile: file,
                          mediaUrl: previewUrl,
                          imageSource: 'upload'
                        });
                        // Notify parent about the file
                        if (onFileUpload) {
                          onFileUpload(index, file, 'image');
                        }
                      }
                    }}
                    className="mb-2"
                  />
                  {block.uploadedFile && (
                    <div className="mt-2">
                      <Image
                        src={block.mediaUrl}
                        thumbnail
                        style={{ maxHeight: '200px' }}
                        alt="Uploaded image preview"
                      />
                      <div className="text-muted small mt-1">
                        Fichier: {block.uploadedFile.name} ({(block.uploadedFile.size / 1024).toFixed(2)} KB)
                      </div>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="mt-1 d-block"
                        onClick={() => {
                          if (block.mediaUrl && block.mediaUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(block.mediaUrl);
                          }
                          updateBlock(index, { ...block, mediaUrl: '', uploadedFile: null });
                        }}
                      >
                        {t('removeImage')}
                      </Button>
                    </div>
                  )}
                </Tab>
                <Tab eventKey="existing" title={t('selectExisting')}>
                  <Form.Select
                    value={block.mediaUrl || ''}
                    onChange={(e) => updateBlock(index, { ...block, mediaUrl: e.target.value, uploadedFile: null, imageSource: 'existing' })}
                  >
                    <option value="">{t('selectExisting')}...</option>
                    {availableImages && availableImages.length > 0 ? (
                      availableImages.map((img, idx) => (
                        <option key={idx} value={img}>
                          Image {idx + 1}
                        </option>
                      ))
                    ) : (
                      <option disabled>{t('noContent')}</option>
                    )}
                  </Form.Select>
                  {block.mediaUrl && block.imageSource === 'existing' && (
                    <div className="mt-2">
                      <Image
                        src={block.mediaUrl.startsWith('http') ? block.mediaUrl : `http://localhost:5000${block.mediaUrl}`}
                        thumbnail
                        style={{ maxHeight: '200px' }}
                        alt="Selected image"
                      />
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="mt-1 d-block"
                        onClick={() => updateBlock(index, { ...block, mediaUrl: '', uploadedFile: null })}
                      >
                        {t('removeImage')}
                      </Button>
                    </div>
                  )}
                </Tab>
              </Tabs>
            </div>
          )}
          {block.type === 'video' && (
            <div>
              <Tabs defaultActiveKey={block.videoSource || 'url'} className="mb-3" onSelect={(k) => {
                const newBlock = { ...block, videoSource: k, mediaUrl: '', uploadedFile: null };
                if (k === 'url') {
                  newBlock.mediaType = 'youtube'; // Default to YouTube for URL
                } else if (k === 'upload') {
                  newBlock.mediaType = 'file';
                } else if (k === 'existing') {
                  newBlock.mediaType = 'file';
                }
                updateBlock(index, newBlock);
              }}>
                <Tab eventKey="url" title="Via URL">
                  <Form.Select
                    value={block.mediaType || 'youtube'}
                    onChange={(e) => updateBlock(index, { ...block, mediaType: e.target.value, mediaUrl: '', uploadedFile: null })}
                    className="mb-2"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                  </Form.Select>
                  <Form.Control
                    type="url"
                    value={block.mediaUrl || ''}
                    onChange={(e) => updateBlock(index, { ...block, mediaUrl: e.target.value, uploadedFile: null })}
                    placeholder={block.mediaType === 'youtube' ? t('enterVideoUrl') : t('enterFacebookUrl')}
                  />
                </Tab>
                <Tab eventKey="upload" title={t('uploadFromDevice')}>
                  <Form.Control
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Create preview URL
                        const previewUrl = URL.createObjectURL(file);
                        updateBlock(index, { 
                          ...block, 
                          uploadedFile: file,
                          mediaUrl: previewUrl,
                          mediaType: 'file',
                          videoSource: 'upload'
                        });
                        // Notify parent about the file
                        if (onFileUpload) {
                          onFileUpload(index, file, 'video');
                        }
                      }
                    }}
                    className="mb-2"
                  />
                  {block.uploadedFile && (
                    <div className="mt-2">
                      <video 
                        src={block.mediaUrl} 
                        controls 
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                        className="mb-2"
                      />
                      <div className="text-muted small">
                        Fichier: {block.uploadedFile.name} ({(block.uploadedFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </div>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="mt-1 d-block"
                        onClick={() => {
                          if (block.mediaUrl && block.mediaUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(block.mediaUrl);
                          }
                          updateBlock(index, { ...block, mediaUrl: '', uploadedFile: null });
                        }}
                      >
                        {t('removeVideo')}
                      </Button>
                    </div>
                  )}
                </Tab>
                <Tab eventKey="existing" title={t('selectVideo')}>
                  <Form.Select
                    value={block.mediaUrl || ''}
                    onChange={(e) => updateBlock(index, { ...block, mediaUrl: e.target.value, uploadedFile: null, mediaType: 'file', videoSource: 'existing' })}
                  >
                    <option value="">{t('selectVideo')}...</option>
                    {availableVideos && availableVideos.filter(v => v.type === 'file').length > 0 ? (
                      availableVideos.filter(v => v.type === 'file').map((vid, idx) => (
                        <option key={idx} value={vid.url}>
                          Vidéo {idx + 1}
                        </option>
                      ))
                    ) : (
                      <option disabled>{t('noContent')}</option>
                    )}
                  </Form.Select>
                  {block.mediaUrl && block.videoSource === 'existing' && (
                    <div className="mt-2">
                      <video 
                        src={block.mediaUrl.startsWith('http') ? block.mediaUrl : `http://localhost:5000${block.mediaUrl}`}
                        controls 
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                        className="mb-2"
                      />
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="mt-1 d-block"
                        onClick={() => updateBlock(index, { ...block, mediaUrl: '', uploadedFile: null })}
                      >
                        {t('removeVideo')}
                      </Button>
                    </div>
                  )}
                </Tab>
              </Tabs>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

const ContentBlockEditor = ({ contentBlocks, setContentBlocks, availableImages, availableVideos, onFileUpload }) => {
  const { t } = useLanguage();
  const addBlock = (type) => {
    const newBlock = {
      type,
      content: type === 'text' ? '' : '',
      mediaUrl: type !== 'text' ? '' : undefined,
      mediaType: type === 'video' ? '' : undefined,
      order: contentBlocks.length
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const removeBlock = (index) => {
    // Clean up blob URL if exists
    const block = contentBlocks[index];
    if (block && block.mediaUrl && block.mediaUrl.startsWith('blob:')) {
      URL.revokeObjectURL(block.mediaUrl);
    }
    
    const newBlocks = contentBlocks.filter((_, i) => i !== index);
    // Reorder
    newBlocks.forEach((block, i) => {
      block.order = i;
    });
    setContentBlocks(newBlocks);
  };

  const updateBlock = (index, updatedBlock) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index] = updatedBlock;
    setContentBlocks(newBlocks);
  };

  const moveBlock = (dragIndex, hoverIndex) => {
    const newBlocks = [...contentBlocks];
    const draggedBlock = newBlocks[dragIndex];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, draggedBlock);
    // Reorder
    newBlocks.forEach((block, i) => {
      block.order = i;
    });
    setContentBlocks(newBlocks);
  };

  return (
    <div>
      <div className="d-flex gap-2 mb-3">
        <Button variant="outline-primary" size="sm" onClick={() => addBlock('text')}>
          + {t('addText')}
        </Button>
        <Button variant="outline-success" size="sm" onClick={() => addBlock('image')}>
          + {t('addImage')}
        </Button>
        <Button variant="outline-info" size="sm" onClick={() => addBlock('video')}>
          + {t('addVideo')}
        </Button>
      </div>

      {contentBlocks.length === 0 ? (
        <Alert variant="info">
          {t('noContent')}
        </Alert>
      ) : (
        <div>
          {contentBlocks.map((block, index) => (
            <DraggableBlock
              key={index}
              block={block}
              index={index}
              moveBlock={moveBlock}
              updateBlock={updateBlock}
              removeBlock={removeBlock}
              availableImages={availableImages}
              availableVideos={availableVideos}
              onFileUpload={onFileUpload}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentBlockEditor;
