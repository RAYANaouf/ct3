frappe.pages['demo-ct3-page'].on_page_load = function(wrapper) {

	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'system de pointage',
		single_column: true
	});


	$(frappe.render_template("demo_html_page" , {} )).appendTo(page.body);


	//fetch the employees
	frappe.db.get_list('Employee' , {
		fields  : ['employee_name'],
		filters : {}
	}).then(employees =>{
		initializeAttendanceTable(employees.map(employee=>employee.employee_name));
		//console.error(employees)
	}).catch(error =>{
		console.error("Failed to fetch employees:" , error);
	});


}



function initializeAttendanceTable( employees ) {

	//to add event listener
	const form = document.getElementById('pointageForm');
    	//to get the value the user inter
	const monthInput = document.getElementById('pointage_month');

	//to add <th> in the first row <thead> <tr> </tr><thead>
        const daysRow = document.getElementById('days_row');
	//to add <td> in the employees rows <tbody></tbody> 
        const employeeRows = document.getElementById('employee_rows');


	/********  here we start  **************/
	//set default month which is the current one.
	 setDefaultMonth();
	generateTable();

	//event of the form
	form.addEventListener('submit', function(event) {
        	event.preventDefault(); // Prevent default form submission
        	generateTable();
   	});

	//generate table function
	function generateTable() {
		//get the value the user intered
        	const monthValue = monthInput.value;
		//if the user didnt enter the value yet
        	if (!monthValue) return;

		//array destructuring syntax
		const [year, month] = monthValue.split('-').map(Number);
        	//month var is 0-indexed and when inter day as 0 it return the last day of the previous month  and since we inter the month not 0-indexed like jan ==> 1 so it will thought that 1 reffer to fiv and will return the last day in jav month.
		const daysInMonth = new Date(year, month, 0).getDate();


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
        	//const employees = ['Employee 1', 'Employee 2', 'Employee 3'];

        	// Generate employee rows
        	employees.forEach(employee => {
            		const tr = document.createElement('tr');
            		const nameTd = document.createElement('td');
            		nameTd.textContent = employee;
            		tr.appendChild(nameTd);

            		for (let day = 1; day <= daysInMonth; day++) {
                		const td = document.createElement('td');
				frappe.db.get_value('Attendance' , { employee_name  : employee , attendance_date : year+"-"+month+"-"+day } , ['status' , 'attendance_date'])
					.then( r =>{
						let values = r.message;
        					console.log(employee + " => " + day +"/"+month+year + values.status + values.attendance_date);
						td.textContent = values.status === "Present" ?  "+" : values.status === "Absent" ? "-" : "?"; // Placeholder for attendance data
					})
                		tr.appendChild(td);
            		}

            		employeeRows.appendChild(tr);
        	});
    	}

	function setDefaultMonth(){
		const today = new Date();
		const year  = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2,'0');
		const formattedMonth = `${year}-${month}`;

		monthInput.value = formattedMonth;
	}

}
