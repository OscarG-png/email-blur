document.addEventListener('DOMContentLoaded', () => {
	const emailInput = document.getElementById('emailInput') as HTMLInputElement;
	const addEmailButton = document.getElementById(
		'addEmailButton'
	) as HTMLButtonElement;
	const emailsList = document.getElementById('emailList') as HTMLElement;

	// Load emails from storage on popup open
	chrome.storage.sync.get(['emails'], (result) => {
		let emails = result.emails || [];
		renderEmails(emails);
	});

	if (addEmailButton && emailInput && emailsList) {
		addEmailButton.addEventListener('click', () => {
			const email = emailInput.value.trim();
			if (email) {
				chrome.storage.sync.get(['emails'], (result) => {
					let emails = result.emails || [];
					emails.push(email);

					// Save the updated list to storage
					chrome.storage.sync.set({ emails: emails }, () => {
						console.log('Email saved:', email);
						emailInput.value = '';
						renderEmails(emails);
					});
				});
			}
		});
	}

	function renderEmails(emails: string[]) {
		if (!emailsList) return;
		emailsList.innerHTML = ''; // Clear the list

		emails.forEach((email: string) => {
			const listItem = document.createElement('li');
			listItem.textContent = email;

			// Add a delete button for each email
			const deleteButton = document.createElement('button');
			deleteButton.textContent = 'Delete';
			deleteButton.addEventListener('click', () => {
				deleteEmail(email);
			});

			listItem.appendChild(deleteButton);
			emailsList.appendChild(listItem);
		});
	}

	function deleteEmail(emailToDelete: string) {
		chrome.storage.sync.get(['emails'], (result) => {
			let emails = result.emails || [];
			emails = emails.filter((email: string) => email !== emailToDelete);

			chrome.storage.sync.set({ emails: emails }, () => {
				console.log('Email deleted:', emailToDelete);
				renderEmails(emails);
			});
		});
	}
});
