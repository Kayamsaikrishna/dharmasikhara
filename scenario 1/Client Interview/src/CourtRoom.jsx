import React, { useState } from 'react';

const CourtRoom = () => {
  const [showEntrance, setShowEntrance] = useState(true);
  const [showCourtRoom, setShowCourtRoom] = useState(false);

  const enterCourtRoom = () => {
    setShowEntrance(false);
    setTimeout(() => {
      setShowCourtRoom(true);
    }, 500); // Small delay for transition effect
  };

  if (showEntrance) {
    return (
      <div className="court-entrance" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#1a1a2e', marginBottom: '20px' }}>Court Entrance</h1>
        
        <div className="sketchfab-embed-wrapper" style={{ margin: '0 auto', maxWidth: '100%' }}>
          <iframe 
            title="Court" 
            frameborder="0" 
            allowfullscreen 
            mozallowfullscreen="true" 
            webkitallowfullscreen="true" 
            allow="autoplay; fullscreen; xr-spatial-tracking" 
            xr-spatial-tracking 
            execution-while-out-of-viewport 
            execution-while-not-rendered 
            web-share 
            src="https://sketchfab.com/models/264abeb233114bb2a4cb46b036b0b97f/embed"
            style={{ width: '100%', height: '700px', border: 'none' }}
          >
          </iframe>
          <p style={{ fontSize: '13px', fontWeight: 'normal', margin: '5px', color: '#4A4A4A' }}>
            <a href="https://sketchfab.com/3d-models/court-264abeb233114bb2a4cb46b036b0b97f?utm_medium=embed&utm_campaign=share-popup&utm_content=264abeb233114bb2a4cb46b036b0b97f" target="_blank" rel="nofollow" style={{ fontWeight: 'bold', color: '#1CAAD9' }}> Court </a> 
            by <a href="https://sketchfab.com/dhiren-sah?utm_medium=embed&utm_campaign=share-popup&utm_content=264abeb233114bb2a4cb46b036b0b97f" target="_blank" rel="nofollow" style={{ fontWeight: 'bold', color: '#1CAAD9' }}> dhiren-sah </a> 
            on <a href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=264abeb233114bb2a4cb46b036b0b97f" target="_blank" rel="nofollow" style={{ fontWeight: 'bold', color: '#1CAAD9' }}>Sketchfab</a>
          </p>
        </div>
        
        <div className="entrance-controls" style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2>Welcome to the Courtroom</h2>
          <p>Please enter the courtroom to proceed with the simulation</p>
          <button 
            onClick={enterCourtRoom}
            className="btn"
            style={{ 
              padding: '12px 24px', 
              fontSize: '18px', 
              marginTop: '20px',
              backgroundColor: '#1a1a2e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Enter Courtroom
          </button>
        </div>
      </div>
    );
  }

  if (showCourtRoom) {
    return (
      <div className="court-room-view" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#1a1a2e', marginBottom: '20px' }}>Court Room</h1>
        
        <div className="sketchfab-embed-wrapper" style={{ margin: '0 auto', maxWidth: '100%' }}>
          <iframe 
            title="Court_Room" 
            frameborder="0" 
            allowfullscreen 
            mozallowfullscreen="true" 
            webkitallowfullscreen="true" 
            allow="autoplay; fullscreen; xr-spatial-tracking" 
            xr-spatial-tracking 
            execution-while-out-of-viewport 
            execution-while-not-rendered 
            web-share 
            src="https://sketchfab.com/models/b6d2b91c652148479400923a2cabb2d1/embed"
            style={{ width: '100%', height: '700px', border: 'none' }}
          >
          </iframe>
          <p style={{ fontSize: '13px', fontWeight: 'normal', margin: '5px', color: '#4A4A4A' }}>
            <a href="https://sketchfab.com/3d-models/court-room-b6d2b91c652148479400923a2cabb2d1?utm_medium=embed&utm_campaign=share-popup&utm_content=b6d2b91c652148479400923a2cabb2d1" target="_blank" rel="nofollow" style={{ fontWeight: 'bold', color: '#1CAAD9' }}> Court_Room </a> 
            by <a href="https://sketchfab.com/pradeep1?utm_medium=embed&utm_campaign=share-popup&utm_content=b6d2b91c652148479400923a2cabb2d1" target="_blank" rel="nofollow" style={{ fontWeight: 'bold', color: '#1CAAD9' }}> 3D Dreamscapes </a> 
            on <a href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=b6d2b91c652148479400923a2cabb2d1" target="_blank" rel="nofollow" style={{ fontWeight: 'bold', color: '#1CAAD9' }}>Sketchfab</a>
          </p>
        </div>
        
        <div className="court-controls" style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <button 
            onClick={() => { setShowCourtRoom(false); setShowEntrance(true); }}
            className="btn"
            style={{ 
              padding: '8px 16px', 
              fontSize: '14px', 
              marginTop: '10px',
              backgroundColor: '#1a1a2e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Entrance
          </button>
        </div>
        
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Model Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '15px' }}>
            <div>
              <h3>Geometry</h3>
              <ul>
                <li>Triangles: 3.8k</li>
                <li>Quads: 98.2k</li>
                <li>Polygons: 257</li>
                <li>Total triangles: 202.3k</li>
                <li>Vertices: 107k</li>
              </ul>
            </div>
            
            <div>
              <h3>Textures & Materials</h3>
              <ul>
                <li>Textures: 20</li>
                <li>Materials: 7</li>
                <li>PBR: metalness</li>
                <li>UV Layers: Yes</li>
                <li>Vertex colors: No</li>
              </ul>
            </div>
            
            <div>
              <h3>Animations & Rigging</h3>
              <ul>
                <li>Animations: 0</li>
                <li>Rigged geometries: No</li>
                <li>Morph geometries: 0</li>
                <li>Scale transformations: No</li>
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h3>License</h3>
            <p>Standard License</p>
            <p>Download size: 139MB</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CourtRoom;