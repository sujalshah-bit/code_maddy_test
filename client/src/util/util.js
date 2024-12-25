export const getLanguageFromFileExtension = (filename) => {
  console.log(filename)
    const extension = filename.split('.').pop();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'json':
        return 'json';
      case 'jsx':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      // Add more cases as needed
      default:
        return 'plaintext';
    }
  };