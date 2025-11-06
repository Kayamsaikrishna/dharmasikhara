# Courtroom Simulation Implementation

## Overview

This document explains the implementation of the advanced courtroom simulation with the bail hearing script integration.

## Features Implemented

1. **3D Virtual Courtroom Environment**
   - Realistic courtroom with judge's bench, witness stand, lawyer tables, audience gallery
   - Interactive elements: lights, fans, door, witness entry
   - Dynamic lighting and shadows
   - Multiple camera views (judge, witness, audience, defense, prosecution, free movement)

2. **Bail Hearing Script Integration**
   - Complete bail hearing script with 152 sequences
   - Character-specific dialogue display with role information
   - Automatic camera focusing on speakers
   - Voice synthesis with gender-specific voices

3. **User Interaction**
   - Defense attorney role for the user
   - Text input for legal arguments
   - Objection button for immediate objections
   - Voice recording capability

4. **Advanced Controls**
   - Keyboard shortcuts for all functions
   - Toggle controls for courtroom elements
   - Gavel sound effect
   - Night mode

## File Structure

```
/frontend/src/components/CourtroomAISimulation.tsx    # Main courtroom component
/public/scenario1/bail_hearing_script.json           # Bail hearing script
/frontend/src/pages/CourtroomSimulationTest.tsx      # Test page
/backend/server.js                                   # Backend server with static file serving
```

## How to Access the Simulation

1. Navigate to the test scenarios page: `/test-scenarios`
2. Click on the "Courtroom Simulation Test" link
3. The simulation will load in full-screen mode

## Controls

### Keyboard Shortcuts
- L: Toggle lights
- F: Toggle fans
- G/J: Strike gavel
- W: Toggle witness
- D: Toggle door
- N: Toggle night mode
- R: Reset camera
- M: Toggle sound
- 1: Judge view
- 2: Witness view
- 3: Audience view
- 4: Defense view
- 5: Prosecution view
- 6: Free movement view

### UI Controls
- Start Simulation: Begin the bail hearing
- End Simulation: Exit the simulation
- Sound ON/OFF: Toggle audio
- Various toggle buttons for courtroom elements
- Text input for user responses
- Objection button for immediate objections

## Character Voices

- Male characters (Defense Attorney, Public Prosecutor, Court Clerk, Ramesh Kumar, Arjun Rao, Rajesh Kumar): Lower pitch voice
- Female characters (Magistrate): Higher pitch voice

## Technical Implementation

### Three.js Integration
- Dynamic loading of Three.js library
- Realistic 3D courtroom environment
- Animated elements (fans, audience members)
- Interactive controls with mouse drag and scroll zoom

### Voice Synthesis
- Web Speech API for text-to-speech
- Character-specific voice settings
- Automatic speaking when dialogue appears

### Simulation Flow
1. Welcome screen with role information
2. Start simulation button
3. Sequential playback of bail hearing script
4. Automatic camera focusing on speakers
5. User input for responses
6. Progress tracking
7. End simulation option

## Customization

To modify the bail hearing script:
1. Edit `/public/scenario1/bail_hearing_script.json`
2. The changes will be reflected automatically in the simulation

To modify the courtroom environment:
1. Edit `/frontend/src/components/CourtroomAISimulation.tsx`
2. Modify the `buildRealisticCourtroom` function and related functions

## Testing

To test the courtroom simulation:
1. Start both frontend and backend servers
2. Navigate to `/test-scenarios`
3. Click on "Courtroom Simulation Test"
4. Click "Begin Bail Hearing Simulation"