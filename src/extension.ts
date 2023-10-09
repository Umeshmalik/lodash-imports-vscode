// Lodash
import _join from "lodash/join";
import _slice from "lodash/slice";
import _includes from "lodash/includes";
import _get from "lodash/get";
import _map from "lodash/map";
import _split from "lodash/split";
import _size from "lodash/size";
import _isEqual from "lodash/isEqual";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { oneParamFunc, towParamsFunc } from "./constants";

const newLine = "\n";
const lodashComment = "// Lodash";

export function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  vscode.commands.registerCommand(
    "extension.import-lodash-sub-module",
    function (name) {
      // Get the active text editor
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;
        // Get the word within the selection
        editor.edit((editBuilder) => {
          const importLine = `import _${name} from 'lodash/${name}';`;
          if (!_includes(document.getText(), importLine)) {
            let lineToAdd = -1;
            let firstLine = -1;
            const rawFile = document.getText();
            const splittedRawFile = _map(
              _split(rawFile, newLine),
              (line: string) => line.toLowerCase()
            );
            for (let i = 0; i < _size(splittedRawFile); i++) {
              const currentLine = _get(splittedRawFile, i);
              const initialWord = _split(currentLine, " ").shift();
              if (
                _includes(currentLine, "lodash/") &&
                _isEqual(initialWord, "import")
              ) {
                lineToAdd = i;
                if (firstLine === -1) {
                  firstLine = i;
                }
              }
            }
            const stringBefore = _join(
              _slice(splittedRawFile, 0, lineToAdd + 1),
              " "
            );
            const currentLineSize = _size(stringBefore) ?? 0;
            const stringBeforeForComment = _join(
              _slice(splittedRawFile, 0, firstLine),
              " "
            );
            const sizeUptoFirstLodashImport = _size(stringBeforeForComment);
            if (
              lodashComment.toLowerCase() !==
                _get(splittedRawFile, firstLine - 1) &&
              lineToAdd !== -1
            ) {
              editBuilder.insert(
                document.positionAt(sizeUptoFirstLodashImport),
                newLine + lodashComment
              );
            }
            if (lineToAdd === -1) {
              editBuilder.insert(
                document.positionAt(0),
                lodashComment + newLine + importLine + newLine
              );
            } else {
              editBuilder.insert(
                document.positionAt(currentLineSize),
                newLine + importLine
              );
            }
          }
        });
      }
    }
  );

  const provider = vscode.languages.registerCompletionItemProvider(
    ["javascript", "typescript"],
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
      ) {
        // ... (Your existing code)

        return _map([...oneParamFunc, ...towParamsFunc], (method: string) => {
          const snippetCompletion = new vscode.CompletionItem(`_${method}`);
          snippetCompletion.filterText = `_${method}`;
          snippetCompletion.detail = `lodash/${method}`;
          const str = _includes(oneParamFunc, method)
            ? `_${method}($1)`
            : `_${method}($1, $2)`;

          const lineText = document.lineAt(position.line).text;
          const textAfterCursor = lineText.slice(position.character);

          if (textAfterCursor.charAt(0) === "(") {
            // If there's an open parenthesis after the cursor, add only the method name
            snippetCompletion.insertText = new vscode.SnippetString(
              `_${method}`
            );
          } else {
            // If not, add the method with parentheses
            snippetCompletion.insertText = new vscode.SnippetString(str);
          }

          snippetCompletion.command = {
            command: "extension.import-lodash-sub-module",
            arguments: [method],
            title: "import-lodash-sub-module...",
          };

          return snippetCompletion;
        });
      },
    }
  );

  context.subscriptions.push(provider);
}

// this method is called when your extension is deactivated
export function deactivate() {}
