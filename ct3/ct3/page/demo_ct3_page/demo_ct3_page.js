frappe.pages['demo-ct3-page'].on_page_load = function(wrapper) {

	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'demo page',
		single_column: true
	});


	//let $btn = page.set_primary_action('Primery Action!' , ()=>frappe.msgprint("clicked primery") );
	//let $btnOne = page.set_secondary_action('Second Action' , () => frappe.msgprint("clicked second"));

	//page.add_menu_item('item1' , ()=> frappe.msgprint("click item1"));

	//page.add_action_item('action1' , ()=> frappe.msgprint("action1 clicked"))

	//let field = page.add_field ({
	//	label: 'Status',
	//	fieldtype: 'Select',
	//	fieldname: 'status',
	//	options:[
	//		'Open',
	//		'Succes',
	//		'Cancelled'
	//	],
	//	change(){
	//		let indicator_color;
	//		let value = field.get_value()
	//		//frappe.msgprint(value)

	//		if(value == 'Cancelled'){
	//			page.set_indicator(value , "gray")
	//		}
	//		else if(value == 'Open'){
	//			page.set_indicator(value , "blue")
	//		}
	//		else if(value == 'Succes'){
	//			page.set_indicator(value , "green")
	//		}
	//	}
	//});

	$(frappe.render_template("demo_html_page" , {} )).appendTo(page.body);

	initializeAttendanceTable()
}



function initializeAttendanceTable() {
    const form = document.getElementById('pointageForm');
    const monthInput = document.getElementById('pointageMonth');

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
