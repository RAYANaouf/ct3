frappe.pages['demo-ct3-page'].on_page_load = function(wrapper) {

	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'system de pointage.',
		single_column: true
	});


	$(frappe.render_template("demo_html_page" , {} )).appendTo(page.body);

	initializeAttendanceTable()
}



function initializeAttendanceTable() {
    const form = document.getElementById('pointageForm');
    const monthInput = document.getElementById('pointage_month');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
        generateTable();
    });

    function generateTable() {
        const monthValue = monthInput.value;
        if (!monthValue) return;

        const [year, month] = monthValue.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        const daysRow = document.getElementById('days_row');
        const employeeRows = document.getElementById('employee_rows');

        // Clear previous table data
        daysRow.innerHTML = '';
        employeeRows.innerHTML = '';

        // Create header for employee names
        const nameHeader = document.createElement('th');
        nameHeader.textContent = 'Name';
        daysRow.appendChild(nameHeader);

        // Generate days headers
        for (let day = 1; day <= daysInMonth; day++) {
            const th = document.createElement('th');
            th.textContent = day;
            daysRow.appendChild(th);
        }

        // Sample employees data (Replace with dynamic data as needed)
        const employees = ['Employee 1', 'Employee 2', 'Employee 3'];

        // Generate employee rows
        employees.forEach(employee => {
            const tr = document.createElement('tr');
            const nameTd = document.createElement('td');
            nameTd.textContent = employee;
            tr.appendChild(nameTd);

            for (let day = 1; day <= daysInMonth; day++) {
                const td = document.createElement('td');
                td.textContent = '-'; // Placeholder for attendance data
                tr.appendChild(td);
            }

            employeeRows.appendChild(tr);
        });
    }
}
