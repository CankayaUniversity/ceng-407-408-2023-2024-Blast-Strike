export function calculateDiff(lat1, lon1, lat2, lon2) {

    const diff = lon2 - lon1;
    const y = Math.sin(diff) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(diff);
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    return (angle + 360) % 360; 
  }

  export function detectLatLon(lat1, lon1, heading, fov, lat2, lon2) {
    const angleToOpponent = calculateDiff(lat1, lon1, lat2, lon2);
    const relativeAngle = (angleToOpponent - heading + 360) % 360;
    const halfFOV = fov / 2;
    return (relativeAngle <= halfFOV || relativeAngle >= (360 - halfFOV));
  }