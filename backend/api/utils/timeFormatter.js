export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Just now";

  const postDate = new Date(timestamp);
  const nowDate = new Date();
  
  // Calculate difference in milliseconds
  const differenceInMs = nowDate - postDate;
  
  // Convert into practical time units
  const minutes = Math.floor(differenceInMs / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Return the appropriate matching string format
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  
  return `${days} day${days === 1 ? '' : 's'} ago`;
};