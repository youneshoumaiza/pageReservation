document.addEventListener('DOMContentLoaded', () => {
    let adultsCount = 1;
    let childrenCount = 0;
    const maxPersons = 4;

    const reservationForm = document.getElementById('reservationForm');
    const roomOptionsContainer = document.getElementById('roomOptionsContainer');
    const childrenAgesDiv = document.getElementById('childrenAges');

    const updateChildrenAges = (count) => {
        childrenAgesDiv.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const select = document.createElement('select');
            select.name = `ageChild${i}`;
            for (let j = 0; j <= 17; j++) {
                const option = document.createElement('option');
                option.value = j;
                option.textContent = j;
                select.appendChild(option);
            }
            childrenAgesDiv.appendChild(select);
        }
    };

    const updateCounts = () => {
        document.getElementById('adults').textContent = adultsCount;
        document.getElementById('children').textContent = childrenCount;
    };

    const incrementValue = (targetId) => {
        if (adultsCount + childrenCount < maxPersons) {
            if (targetId === 'adults') {
                adultsCount++;
            } else if (targetId === 'children') {
                childrenCount++;
                updateChildrenAges(childrenCount);
            }
            updateCounts();
        } else {
            alert('Le nombre total d\'adultes et d\'enfants ne doit pas dépasser 4 personnes.');
        }
    };

    const decrementValue = (targetId) => {
        if (targetId === 'adults' && adultsCount > 1) {
            adultsCount--;
        } else if (targetId === 'children' && childrenCount > 0) {
            childrenCount--;
            updateChildrenAges(childrenCount);
        }
        updateCounts();
    };

    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('increment')) {
            incrementValue(event.target.dataset.target);
        } else if (event.target.classList.contains('decrement')) {
            decrementValue(event.target.dataset.target);
        }
    });

    reservationForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const dateDebut = document.getElementById('dateDebut').value;
        const dateFin = document.getElementById('dateFin').value;
        const adults = adultsCount;
        const children = childrenCount;

        const childrenAges = [];
        for (let i = 0; i < children; i++) {
            const age = document.getElementsByName(`ageChild${i}`)[0].value;
            childrenAges.push(parseInt(age));
        }

        // Call the backend API to get room options
        fetchRoomOptions(dateDebut, dateFin, adults, childrenAges);
    });

    const fetchRoomOptions = (dateDebut, dateFin, adults, childrenAges) => {
        fetch('http://localhost:8081/ligneReservations/options', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dateDebut,
                dateFin,
                nbrAdultes: adults,
                agesEnfants: childrenAges
            }),
        })
        .then(response => response.json())
        .then(data => displayRoomOptions(data))
        .catch(error => console.error('Error fetching room options:', error));
    };

    const displayRoomOptions = (roomOptions) => {
        roomOptionsContainer.innerHTML = '';
        roomOptions.forEach(option => {
            const roomOptionDiv = document.createElement('div');
            roomOptionDiv.className = 'room-option';

            // Create a dropdown of prices based on availability
            let pricesDropdown = '<select>';
            for (let i = 1; i <= option.availability; i++) { // Ensure 'availability' is correct
                const price = option.prixNonRemboursable * i;
                pricesDropdown += `<option value="${i}">${i} chambre(s) : MAD${price.toFixed(2)}</option>`;
            }
            pricesDropdown += '</select>';

            roomOptionDiv.innerHTML = `
                <img src="${option.fff}" alt="${option.nom}">
                <div>
                    <h2>${option.nom}</h2>
                    <p>Nombre de chalets disponibles: ${option.availability}</p> <!-- Ensure 'availability' is correct -->
                    <p>Prix Non Remboursable: MAD${option.prixNonRemboursable.toFixed(2)}</p>
                    ${pricesDropdown}
                </div>
            `;
            roomOptionsContainer.appendChild(roomOptionDiv);
        });
    };

    // Initial update of counts
    updateCounts();
});
