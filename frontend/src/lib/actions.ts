// Portal action
export function portal(node: HTMLElement, name: string) {
  // find an element with this ID somewhere in the document
  let slot = document.getElementById(name);
  // move this node to that element
  slot?.appendChild(node);

  return {
    destroy() {
      // remove the node when component is destroyed
      node.remove();
    },
  };
}
