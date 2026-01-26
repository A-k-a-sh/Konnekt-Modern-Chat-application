

export function formatDateString(dateString) {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
  
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", options);
  
    const time = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  
    return `${formattedDate} at ${time}`;
  }
  


export const multiFormatDateString = (timestamp = "") => {
    const timestampNum = Math.round(new Date(timestamp).getTime() / 1000);
    const date = new Date(timestampNum * 1000);
    const now = new Date();
  
    const diff = now.getTime() - date.getTime();
    const diffInSeconds = diff / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;
  
    if (Math.floor(diffInDays) >= 30) {
      return formatDateString(timestamp);
    } else if (Math.floor(diffInDays) === 1) {
      return `${Math.floor(diffInDays)} day ago`;
    } else if (Math.floor(diffInDays) > 1 && diffInDays < 30) {
      return `${Math.floor(diffInDays)} days ago`;
    } else if (Math.floor(diffInHours) >= 1) {
      return `${Math.floor(diffInHours)} h ago`;
    } else if (Math.floor(diffInMinutes) >= 1) {
      return `${Math.floor(diffInMinutes)} min ago`;
    } else {
      return "Just now";
    }
  };
  

  /*
  call the func:

console.log(multiFormatDateString("2024-03-23T14:30:00Z"));

console.log(multiFormatDateString(new Date().toISOString()));


console.log(multiFormatDateString("2024-03-20 10:15:00"));




  */