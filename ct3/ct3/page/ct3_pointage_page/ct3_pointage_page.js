frappe.pages['ct3_pointage_page'].on_page_load = function(wrapper) {

	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'system de pointage',
		single_column: true
	});


	$(frappe.render_template("ct3_pointage_page" , {} )).appendTo(page.body);

	main();

}



function main(){



	//to add event listener
	const form = document.getElementById('pointageForm');
    	//to get the value the user inter
	const monthInput = document.getElementById('pointage_month');


	//event of the form
	form.addEventListener('submit', function(event) {
        	event.preventDefault(); // Prevent default form submission
        	generateTable();
   	});


	/********  here we start  **************/
	//set default month which is the current one.
	setDefaultMonth(monthInput);

	//get the value the user intered
	const monthValue = monthInput.value;

	//array destructuring syntax
	const [year, month] = monthValue.split('-').map(Number);

       	//month var is 0-indexed and when inter day as 0 it return the last day of the previous month  and since we inter the month not 0-indexed like jan ==> 1 so it will thought that 1 reffer to fiv and will return the last day in jav month.
	const daysInMonth = new Date(year, month, 0).getDate();




        frappe.db.get_list('Employee' , {
      		fields  : ['employee' , 'employee_name'],
                filters : {}
        }).then(employees =>{
		frappe.db.get_list('Attendance' , {
			fields  : ['employee' , 'employee_name' , 'attendance_date' , 'working_hours' , 'status' , 'leave_type' , 'in_time' , 'out_time' , 'late_entry' ],
                	filters: {
			}
		}).then(attendancesRecords => {
			generateTable(daysInMonth , mapping(employees , attendancesRecords));
		}).catch(error =>{
			console.error("Failed to fetch attendance" , error);
		})

        }).catch(error =>{
                console.error("Failed to fetch employees:" , error);
        });



}




function setDefaultMonth(monthInput){
	const today = new Date();
	const year  = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2,'0');
	const formattedMonth = `${year}-${month}`;
	monthInput.value = formattedMonth;
}



function mapping(employees , attendanceRecords){
	const attendanceMap = {}

	employees.forEach(employee =>{
		attendanceMap[employee.employee] = {
			employee_name : employee.employee_name,
			attendances   : {}
		}
	})

	attendanceRecords.forEach( attendanceRecord => {
		const employee_id     = attendanceRecord.employee;
		const attendance_date = new Date(attendanceRecord.attendance_date).getDate();

		if(attendanceMap[employee_id]){
			attendanceMap[employee_id].attendances[attendance_date]={
				status        : attendanceRecord.status,
				working_hours : attendanceRecord.in_time
			}
		}
	})



	return attendanceMap;
}







	//generate table function
function generateTable( daysInMonth , data ) {


	//to add <th> in the first row <thead> <tr> </tr><thead>
        const daysRow = document.getElementById('days_row');
	//to add <td> in the employees rows <tbody></tbody>
        const employeeRows = document.getElementById('employee_rows');


	/******************  prepare the dialog  ********************/
	const dialog = new frappe.ui.Dialog({
		title  : 'Pointage',
		fields : [
			{
				label     : 'Heure travaillé',
				fieldname : 'heure_travaille',
				fieldtype : 'Int'
			},
			{
				label     : "Lieu",
				fieldname : "lieu",
				fieldtype : "Select",
				options   : ["Projet" , "Departement"],
				default: "Projet",
				change(){
					const lieuValue = dialog.get_value('lieu');
					if(lieuValue === "Projet"){
						dialog.set_df_property('type' , 'label' , 'Projet');
					}
					else{
						dialog.set_df_property('type' , 'label' , "Departement")
					}
					// Refresh the field to update the label
                			dialog.fields_dict.project.refresh();
				}
			},
			{
				label     : "Projet",
				fieldname : "type",
				fieldtype : "Select",
			},
			{
				label     : "Heure Nuit",
				fieldname : "heure_nuit",
				fieldtype : "Int"
			},
			{
				label     : "Mission",
				fieldname : "mission",
				fieldtype : "CheckBox"
			}
		],
		size  : 'small',
		primary_action_label :'Done',
		primary_action(values){
			console.log("dialog log : " , values  )
			dialog.hide();
		}
	})


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


	console.log(data)
	Object.keys(data).forEach(employee_id =>{
		const tr            = document.createElement('tr');
		const employee_name = document.createElement('td');
		employee_name.textContent = data[employee_id].employee_name;
		tr.appendChild(employee_name);

		console.log("look" , data[employee_id]);

		for(let day = 1 ; day <= daysInMonth ; day++){

			const td = document.createElement('td');
			if(!data[employee_id].attendances[day]){
				const div = document.createElement('div');
				const p   = document.createElement('p');
				p.textContent = "Non";
				div.appendChild(p);

                                console.log("clicking outside testing")

				td.addEventListener('click', function() {
                                        console.log("clicking insde testing")
					dialog.show();
                                        console.log("click emplty")
                                });
				td.appendChild(div);
				div.classList.add('empty');
				tr.appendChild(td);
				continue;
			}

			const attendanceRecord = data[employee_id].attendances[day]

			if(data[employee_id].attendances[day].status==="Present"){
				const div = document.createElement('div');
				const p   = document.createElement('p');
				p.textContent = "P";
				div.appendChild(p);
				div.classList.add('present');
				td.appendChild(div)
			}
			else{
				const div = document.createElement('div');
				const p   = document.createElement('p');
				p.textContent = "A";
				div.appendChild(p);
                                div.addEventListener('click', function() {
                                        frappe.msgprint({
                                                title: __('Attendance Status'),
                                                indicator: 'red',
                                                message: __('Employee is Absent')
                                        });
                                        console.log("click emplty")
                                });
				div.classList.add('absent');
				td.appendChild(div)

			}

			tr.appendChild(td);

		}
		employeeRows.appendChild(tr);
	})

	// Generate employee rows
	//employees.forEach(employee => {
    	//	const tr = document.createElement('tr');
    	//	const nameTd = document.createElement('td');
    	//	nameTd.textContent = employee.employee_name;
    	//	tr.appendChild(nameTd);

    	//	for (let day = 1; day <= daysInMonth; day++) {
       	//	const td = document.createElement('td');
	//	frappe.db.get_value('Attendance' , { employee  : employee.employee , attendance_date : year+"-"+month+"-"+day } , ['status' , 'attendance_date'])
	//			.then( r =>{
	//				let values = r.message;
	//				console.log(employee + " => " + day +"/"+month+year + values.status + values.attendance_date);
	//				td.textContent = values.status === "Present" ?  "+" : values.status === "Absent" ? "-" : "?"; // Placeholder for attendance data
	//			})
       	//	tr.appendChild(td);
    	//	}

    	//	employeeRows.appendChild(tr);
	//});
}
