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
        	start_work();
   	});

	//set default month which is the current one.
	setDefaultMonth(monthInput);


	start_work();



}



function start_work(){


    	//to get the value the user inter
	const monthInput = document.getElementById('pointage_month');

	/********  here we start  **************/

	//get the value the user intered
	const monthValue = monthInput.value;

	//array destructuring syntax
	const [year, month] = monthValue.split('-').map(Number);

       	//month var is 0-indexed and when inter day as 0 it return the last day of the previous month  and since we inter the month not 0-indexed like jan ==> 1 so it will thought that 1 reffer to fiv and will return the last day in jav month.
	const daysInMonth = new Date(year, month, 0).getDate();


	// Calculate the start and end dates of the month  to filtring the attendance result.
	const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
	const endDate = new Date(year, month, 0).toISOString().split('T')[0];



        frappe.db.get_list('Employee' , {
      		fields  : ['employee' , 'employee_name'],
                filters : {}
        }).then(employees =>{
		frappe.db.get_list('Attendance' , {
			fields  : ['employee' , 'employee_name' , 'attendance_date' , 'working_hours' , 'status' , 'leave_type' , 'in_time' , 'out_time' , 'custom_heure_nuit' ],
                	filters: {
            			attendance_date: ['between', [startDate, endDate]]
			}
		}).then(attendancesRecords => {
			generateTable(year , month , daysInMonth , mapping(employees , attendancesRecords));
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
				working_hours : attendanceRecord.working_hours,
				heure_nuit    : attendanceRecord.custom_heure_nuit
			}
		}
	})



	return attendanceMap;
}







	//generate table function
function generateTable( year , month , daysInMonth , data ) {


	//to add <th> in the first row <thead> <tr> </tr><thead>
        const daysRow = document.getElementById('days_row');
	//to add <td> in the employees rows <tbody></tbody>
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
				div.textContent = "Non";

				td.addEventListener('click', function() {
					create_dialog( year , month , daysInMonth , data , employee_id , year+"-"+month+"-"+day).show();
                                });
				td.appendChild(div);
				div.classList.add('empty');
				tr.appendChild(td);
				continue;
			}

			const attendanceRecord = data[employee_id].attendances[day]

			if(data[employee_id].attendances[day].status==="Present"){
				const div = document.createElement('div');
				const working_hours   = document.createElement('div');
				const heure_nuit      = document.createElement('div');

				working_hours.textContent =   data[employee_id].attendances[day].working_hours
				heure_nuit.textContent    =   data[employee_id].attendances[day].heure_nuit

				div.appendChild(working_hours);
				div.appendChild(heure_nuit);

				div.classList.add('container');
				working_hours.classList.add('working_hours');
				heure_nuit.classList.add('heure_nuit');

                                div.addEventListener('click', function() {
                                        frappe.msgprint({
                                                title: __('Attendance Status'),
                                                indicator: 'red',
                                                message: __('Attendance is already exist!')
                                        });
                                });

				td.appendChild(div)
			}
			else{
				const div = document.createElement('div');
				const p   = document.createElement('p');
				p.textContent = "A";
				div.appendChild(p);
				div.classList.add('absent');
				td.appendChild(div)

			}

			tr.appendChild(td);

		}
		employeeRows.appendChild(tr);
	})

}



function create_dialog( year , month , daysInMonth , data , employee_id , date){
	/******************  prepare the dialog  ********************/
	return dialog = new frappe.ui.Dialog({
		title  : 'Pointage',
		fields : [
			{
				label     : 'Heure travaillé',
				fieldname : 'heure_travaille',
				fieldtype : 'Int',
				default   : 8,
				change(){
					const working_hours = dialog.get_value('heure_travaille')
					if(working_hours == 0){
						dialog.set_df_property('motif_jour','hidden',0)
					}
					else{
						dialog.set_df_property('motif_jour','hidden',1)
					}
				}
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
				fieldtype : "Checkbox"
			},
			{
                		label: "Motif jour",
                		fieldname: "motif_jour",
		                fieldtype: "Select",
                		options: ["Malade", "Férie", "Autre"],
                		hidden: 1 // Initially hidden
            		}
		],
		size  : 'small',
		primary_action_label :'Done',
		primary_action(values){
			console.log("dialog log : " , values  )

			frappe.db.insert({
				doctype    : 'Attendance' ,
				employee   : employee_id  ,
				attendance_date : date    ,
				status     : 'Present'    ,
				custom_heure_nuit : values.heure_nuit ,
				working_hours     : values.heure_travaille
			}).then(doc =>{
				 start_work()
			})

			dialog.hide();
		}
	})


}
