export const getLanguageFromFileExtension = (filename) => {
  console.log(filename)
    const extension = filename.split('.').pop();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'json':
        return 'json';
      case 'ts':
        return 'typescript';
      case 'py':
        return 'python';
      case 'rb':
        return 'ruby';
      default:
        return extension;
    }
  };

export function formatDate(timestamp) {
    const date = new Date(timestamp)

    // Get hours and minutes
    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, "0")

    // Determine AM or PM
    const amOrPm = hours >= 12 ? "PM" : "AM"

    // Convert to 12-hour format
    hours = hours % 12
    hours = hours ? hours : 12 // Handle midnight

    // Format the date string
    const formattedTime = `${hours}:${minutes} ${amOrPm}`

    return formattedTime
}