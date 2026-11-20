/** @format
 * flenzo Music Bot — Format Time
 */

module.exports = function formatTime(ms) {
  if (!ms || isNaN(ms)) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const hrs  = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0)
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

