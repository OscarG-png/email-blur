function hideEmailAddresses(): void {
	const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
	const elements = document.querySelectorAll('*');

	elements.forEach((element) => {
		if (element.childNodes.length === 0) {
			return;
		}

		element.childNodes.forEach((node) => {
			if (
				node.nodeType === Node.TEXT_NODE &&
				node.textContent &&
				emailRegex.test(node.textContent)
			) {
				const newText = node.textContent.replace(
					emailRegex,
					'[email protected]'
				);
				node.textContent = newText;
			}
		});
	});
}

hideEmailAddresses();

const observer = new MutationObserver(hideEmailAddresses);

observer.observe(document.body, {
	childList: true,
	subtree: true,
	characterData: true,
});
