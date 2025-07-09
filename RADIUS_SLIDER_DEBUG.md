# Radius Slider Debug Guide

## Issue Summary
The radius slider changes aren't updating the power station highlights on the map.

## Data Flow Analysis

### 1. Component Structure
- **LocationAnalysisCard**: Contains the radius dropdown selector
- **SiteEvaluationMap**: Parent component that manages state and renders markers

### 2. State Management
- `searchRadius` state in SiteEvaluationMap (line 45): Default 30 miles
- `searchRadius` local state in LocationAnalysisCard (line 35): Also default 30 miles

### 3. Data Flow Path
1. User changes dropdown in LocationAnalysisCard
2. onChange handler calls:
   - `setSearchRadius(newRadius)` - updates local state
   - `onRadiusChange(newRadius)` - calls parent callback
3. Parent's onRadiusChange (line 443-445) updates parent's searchRadius state
4. `nearbyPowerPlants` useMemo (line 168-192) recalculates with new radius
5. Marker rendering (line 347) checks if plant is in nearbyPowerPlants
6. Highlighted markers get yellow border and glow effect (lines 376-381)

## Debug Logging Added

I've added console.log statements to track the data flow:

1. **LocationAnalysisCard (line 139)**:
   ```javascript
   console.log('LocationAnalysisCard: Setting radius to', newRadius);
   ```

2. **SiteEvaluationMap onRadiusChange (line 444)**:
   ```javascript
   console.log('Radius changed to:', newRadius);
   ```

3. **nearbyPowerPlants useMemo (line 171)**:
   ```javascript
   console.log('Recalculating nearbyPowerPlants with radius:', searchRadius);
   ```

4. **Marker rendering (lines 349-352)**:
   ```javascript
   if (plants.indexOf(plant) < 3 && searchedLocation) {
       console.log(`Plant ${plant.id}: isNearSearched=${isNearSearched}`);
   }
   ```

## Steps to Debug

1. **Open browser console** (F12 or right-click → Inspect → Console)

2. **Search for a location** on the map

3. **Change the radius slider** and observe console output:
   - You should see: "LocationAnalysisCard: Setting radius to [value]"
   - You should see: "Radius changed to: [value]"
   - You should see: "Recalculating nearbyPowerPlants with radius: [value]"
   - You should see plant highlighting status for first 3 plants

4. **Check for issues**:
   - Are all console logs appearing?
   - Is the radius value correct in all logs?
   - Is nearbyPowerPlants recalculating?
   - Are plant isNearSearched values updating?

## Potential Issues to Check

### 1. State Synchronization
The LocationAnalysisCard has its own `searchRadius` state which might get out of sync with the parent.

### 2. UseMemo Dependencies
The `nearbyPowerPlants` useMemo depends on:
- `plants` - power plant data
- `searchedLocation` - searched location
- `searchRadius` - radius value

If any dependency isn't updating, the memo won't recalculate.

### 3. Plant ID Matching
The `isNearSearched` check uses `nearbyPowerPlants.some(p => p.id === plant.id)`
- Ensure plant IDs are consistent between filtered and rendered plants

### 4. Marker Styling
Check if the conditional styles are being applied:
- `border: isNearSearched ? '3px solid #FDE047' : '2px solid white'`
- `boxShadow: isNearSearched ? '0 0 10px rgba(253, 224, 71, 0.5)' : '0 2px 4px rgba(0,0,0,0.3)'`

## Quick Fix Suggestions

1. **Force re-render**: Add a key to force marker re-render
2. **Remove local state**: Consider lifting all radius state to parent
3. **Add explicit radius prop**: Pass searchRadius as prop to LocationAnalysisCard

## Testing the Fix

After debugging:
1. Remove debug console.log statements
2. Test with different radius values
3. Verify highlighting updates correctly
4. Check performance with large datasets