// This is the fixed button section
                  <button
                    onClick={handleUrlSubmit}
                    disabled={!websiteUrl.trim()}
                    className="px-4 py-2 bg-stone-600 hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Add
                  </button>