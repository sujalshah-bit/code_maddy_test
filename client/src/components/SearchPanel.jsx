import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useStore, useStoreActions } from '../editorStore';
import { getLanguageFromFileExtension } from '../util/util';

function SearchPanel({ isVisible, onClose }) {
  const { files,  } = useStore();
  const { setFiles, setEditor } = useStoreActions();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);


  const searchInFileContent = async (fileHandle, query) => {
    try {
      if (fileHandle.handle !== undefined) {
        fileHandle = fileHandle.handle;
      }
      const file = await fileHandle.getFile();
      const content = await file.text();
      const lines = content.split('\n');
      const matches = [];

      lines.forEach((line, lineNumber) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          matches.push({
            lineNumber: lineNumber + 1,
            line: line.trim(),
            preview: line.slice(0, 100)
          });
        }
      });

      if (matches.length > 0) {
        return {
          file: fileHandle.name,
          handle: fileHandle,
          matches
        };
      }
    } catch (error) {
      console.error(`Error searching in ${fileHandle.name}:`, error);
    }
    return null;
  };

  const handleMatchClick = async (fileHandle) => {
    console.log('Match clicked');
    const file = await fileHandle.getFile();
    const text = await file.text();
    setFiles.setCurrent(fileHandle);
    setEditor.setContent(text);
    const language = getLanguageFromFileExtension(file.name);
    setEditor.setLanguage(language);
    setFiles.setActive(fileHandle);
    const fileNames = files.open.map((file) => file.name);
    if (!fileNames.includes(fileHandle.name)) {
      setFiles.setOpen([...files.open, fileHandle]);
    }
  };
  

  useEffect(() => {
    const searchInTree = async (nodes, query) => {
        const results = [];
        
        for (const node of nodes) {
          if (node.kind === 'file') {
            // Search in file name
            if (node.name.toLowerCase().includes(query.toLowerCase())) {
              results.push({
                file: node.name,
                handle: node.handle,
                matches: [{
                  lineNumber: 0,
                  line: node.name,
                  preview: `File name match: ${node.name}`
                }]
              });
            }
            // Search in file content
            const contentMatches = await searchInFileContent(node, query);
            if (contentMatches) {
              results.push(contentMatches);
            }
          } else if (node.kind === 'directory' ) {
            // Recursively search in directory
            // const entries = await Promise.all(
            //     Array.from(await node.handle.values())
            // );
            if(node.name === 'node_modules') {
              continue;
            }
            let temp = node;
            if (temp.handle && typeof temp.handle.values === 'function') {
              temp = temp.handle;
            }
            const entries = [];
            for await (const entry of temp.values()) {
                entries.push(entry);
                console.log(entry);
            }
            console.log(`Searching in directory: ${node.name}`, entries);
            const childResults = await searchInTree(entries, query);
            results.push(...childResults);
          }
        }
        return results;
      };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
          setSearchResults([]);
          return;
        }
    
        setIsSearching(true);
        const results = await searchInTree(files.tree, searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      };
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [files.tree, searchQuery]);

  if (!isVisible) return null;

  return (
    <div className="w-80 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4">
        <div className="flex items-center space-x-2 bg-gray-800 rounded-md px-3 py-1.5">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="bg-transparent border-none outline-none text-gray-300 w-full text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-300" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="text-gray-400 text-sm p-4">Searching...</div>
        ) : searchResults.length > 0 ? (
          <div className="text-sm">
            {searchResults.map((result, index) => (
              <div key={index} className="mb-4">
                <div className="px-4 py-2 text-blue-400 hover:bg-gray-800 cursor-pointer">
                  {result.file}
                </div>
                {result.matches.map((match, matchIndex) => (
                  <div
                    key={matchIndex}
                    className="px-8 py-1 hover:bg-gray-800 cursor-pointer text-gray-300"
                  >
                    <div onClick={() => handleMatchClick(result.handle)} className="flex items-center space-x-2">
                      <span className="text-gray-500">{match.lineNumber}</span>
                      <span className="truncate">{match.preview}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-gray-400 text-sm p-4">No results found</div>
        ) : null}
      </div>
    </div>
  );
}

export default SearchPanel;