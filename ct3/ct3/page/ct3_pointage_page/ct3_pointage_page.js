frappe.pages['ct3_pointage_page'].on_page_load = function(wrapper) {

	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'system de pointage',
		single_column: true
	});


	$(frappe.render_template("ct3_pointage_page" , {} )).appendTo(page.body);



	main();

}





let all_employees = []
let all_attendances = []

let projects_list = [];
let departments_list = [];
let projects_fetched = false;
let departments_fetched = false;

let selected_box = []






function main(){



	const multi_select_mode = document.getElementById('multi_select_mode')
		multi_select_mode.addEventListener("click" , function(){
			fetchTableDataAndDrawIt()
			selected_box = []
		})



	    /******************  Fetch Projects and Departments (only once)  ********************/

	get_all_project_department();

	//set default month which is the current one.
	setDefaultMonth();



    	//to get the value the user inter && get the value the user intered && array destructuring syntax
	const [year , month] = document.getElementById('pointage_month').value.split('-').map(Number);


	//to add event listener
	const form = document.getElementById('pointageForm')


	//event of the form
	form.addEventListener('submit', function(event) {
        	event.preventDefault(); // Prevent default form submission
        	fetchTableDataAndDrawIt();
   	});




	const pointage_btn = document.getElementById('pointage_btn')


	pointage_btn.addEventListener("click" , function(){
		console.log("clickinnnn")
		create_multi_selection_dialog().show()
	})



	fetchTableDataAndDrawIt();



}



function fetchTableDataAndDrawIt(){


    	//to get the value the user inter && get the value the user intered && array destructuring syntax
	const [year , month] = document.getElementById('pointage_month').value.split('-').map(Number);


	// Calculate the start and end dates of the month  to filtring the attendance result.
	const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
	const endDate = new Date(year, month, 0).toISOString().split('T')[0];







        frappe.db.get_list('Employee' , {
      		fields  : ['employee' , 'employee_name'],
                filters : {}
        }).then(employees =>{
		frappe.db.get_list('Attendance' , {
			fields  : ['employee' , 'employee_name' , 'attendance_date' , 'working_hours' , 'status' , 'custom_heure_nuit' , 'custom_project' ,'custom_department' , 'custom_motif' ],
                	filters : {
            			attendance_date: ['between', [startDate, endDate]]
			},
			limit   : 10000
		}).then(attendancesRecords => {
			all_employees = employees
			all_attendances = attendancesRecords
			//console.log("all data between" , startDate , " and " , endDate , " here : " , attendancesRecords  )
			generateTable();
		}).catch(error =>{
			console.error("Failed to fetch attendance" , error);
		})

        }).catch(error =>{
                console.error("Failed to fetch employees:" , error);
        });





}











/****************************   tools methods    ******************************************/



//generate function

//generate table function
function generateTable() {


    	//to get the value the user inter
	const [year , month] = document.getElementById('pointage_month').value.split('-').map(Number);


       	//month var is 0-indexed and when inter day as 0 it return the last day of the previous month  and since we inter the month not 0-indexed like jan ==> 1 so it will thought that 1 reffer to fiv and will return the last day in jav month.
	const daysInMonth = new Date(year, month, 0).getDate();


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


	const data = mapping(all_employees , all_attendances)


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

					if(multi_select_mode.checked){
						const date = year +"-"+ month +"-"+day
						selectItem({employee_id , date});
						if(box_exist({employee_id , date})){
							td.classList.add('selectedBox');
						}
						else{
							td.classList.remove('selectedBox');
						}
					}
					else{
						create_dialog( year , month , daysInMonth , data , employee_id , year+"-"+month+"-"+day).show();
					}
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
				const div      = document.createElement('div');
				const absent   = document.createElement('div');
				let   absent_text = ""
					if(data[employee_id].attendances[day].motif == "Congé sans solde") absent_text = "C.S.S"
					else if(data[employee_id].attendances[day].motif == "Congé annuel")  absent_text = "C.A"
					else if(data[employee_id].attendances[day].motif == "Maladi")  absent_text = "M"
					else if(data[employee_id].attendances[day].motif == "Récuperation")  absent_text = "Récup"
					else if(data[employee_id].attendances[day].motif == "Non validée") absent_text = "N.V"
					else if(data[employee_id].attendances[day].motif == "Absence Autorisée") absent_text = "A.A"
					else if(data[employee_id].attendances[day].motif == "Absence non Autorisée") absent_text = "A.N.A"
					else if(data[employee_id].attendances[day].motif == "Férié") absent_text = "Férié"
					else if(data[employee_id].attendances[day].motif == "Chomé payé") absent_text = "C.P"
					else if(data[employee_id].attendances[day].motif == "Formation") absent_text = "Form"
					else if(data[employee_id].attendances[day].motif == "Autre") absent_text = "Autre"


				absent.textContent  = absent_text;
				div.appendChild(absent);


				div.classList.add('container');
				div.classList.add('absent');
				td.appendChild(div)

			}

			tr.appendChild(td);

		}
		employeeRows.appendChild(tr);
	})

}



//fetch project and departments

function get_all_project_department(){
	if (!projects_fetched) {
        	frappe.db.get_list('Project', {
           		filters: {
                		status: "Open" // Or "Active", depending on your needs
            		},
            		fields: ['name' , 'project_name']
        	}).then(projects => {
			projects_list   = projects;
            		projects_fetched = true;
        	});
    	}
	if (!departments_fetched) {
        	frappe.db.get_list('Department', {
            		filters: {
                		is_group: 0 // Fetch only non-group departments
            		},
            		fields: ['name']
        	}).then(departments => {
            		departments_list = departments.map(dept => dept.name);
            		departments_fetched = true;
        	});
	}

}



//////////  create dialog function


function create_dialog( year , month , daysInMonth , data , employee_id , date){
	/******************  prepare the dialog  ********************/
	const dialog = new frappe.ui.Dialog({
		title  : 'Pointage',
		fields : [
			{
				label     : 'Heure travaillé (H)',
				fieldname : 'heure_travaille',
				fieldtype : 'Float',
				default   : 8,
				change(){
					const working_hours = dialog.get_value('heure_travaille')
					const heure_nuit    = dialog.get_value('heure_nuit')

					if(working_hours == 0 && heure_nuit == 0){
						dialog.set_df_property('motif_jour','hidden',0)
						dialog.set_value('motif_jour',"Congé sans solde")
						dialog.set_df_property('lieu','hidden',1)
						dialog.set_df_property('type','hidden',1)
					}
					else{
						dialog.set_df_property('motif_jour','hidden',1)
						dialog.set_df_property('lieu','hidden',0)
						dialog.set_df_property('type','hidden',0)
					}
				}
			},
			{
				label     : "Heure Nuit (H)",
				fieldname : "heure_nuit",
				fieldtype : 'Float',
				default   : 0.0,
				change(){
					const working_hours = dialog.get_value('heure_travaille')
					const heure_nuit    = dialog.get_value('heure_nuit')

					if(working_hours == 0 && heure_nuit == 0){
						dialog.set_df_property('motif_jour','hidden',0)
						dialog.set_value('motif_jour',"Congé sans solde")
						dialog.set_df_property('lieu','hidden',1)
						dialog.set_df_property('type','hidden',1)
					}
					else{
						dialog.set_df_property('motif_jour','hidden',1)
						dialog.set_df_property('lieu','hidden',0)
						dialog.set_df_property('type','hidden',0)
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
						dialog.set_df_property('type' , 'options' , projects_list)
						if(projects_list.length > 0){
							dialog.set_value('type' , projects_list[0])
						}
					}
					else{
						dialog.set_df_property('type' , 'label' , "Departement")
						dialog.set_df_property('type' , 'options' , departments_list)
						if(departments_list.length > 0){
							dialog.set_value('type' , departments_list[0])
						}
					}
					// Refresh the field to update the label
                			dialog.fields_dict.type.refresh();
				}
			},
			{
				label     : "Projet",
				fieldname : "type",
				fieldtype : "Select",
				options   : projects_list.map(proj => proj.project_name),
				default   : projects_list.length > 0 ? projects_list[0].project_name : "",
			},
			{
				label     : "Mission",
				fieldname : "mission",
				fieldtype : "Check"
			},
			{
                		label: "Motif jour",
                		fieldname: "motif_jour",
		                fieldtype: "Select",
                		options  : ["Congé sans solde","Congé annuel","Maladi","Récuperation","Non validée","Absence Autorisée","Absence non Autorisée","Férié","Chomé payé","Formation", "Autre"],
				hidden: 1 // Initially hidden
            		}
		],
		size  : 'small',
		primary_action_label :'Done',
		primary_action(values){


			const status = (values.heure_nuit ==0 && values.heure_travaille == 0) ? 'Absent' : 'Present'

			if(status == "Absent"){
				frappe.db.insert({
					doctype         : 'Attendance' ,
					employee        : employee_id  ,
					attendance_date : date         ,
					status          : status       ,
					custom_motif    : values.motif_jour
				}).then(doc =>{
					start_work()
					dialog.hide();
				}).catch(error =>{
                	        	console.error("Failed to save the attendance" , error);
					dialog.hide();
                		})

			}else if(values.lieu == "Projet"){
				frappe.db.insert({
					doctype         : 'Attendance' ,
					employee        : employee_id  ,
					attendance_date : date         ,
					status          : status       ,
					custom_heure_nuit : values.heure_nuit ,
					working_hours     : values.heure_travaille,
					custom_project    : getProjectIdByName(values.type),
					custom_mission    : values.mission
				}).then(doc =>{
					start_work()
					dialog.hide();
				}).catch(error =>{
                	        	console.error("Failed to save the attendance" , error);
					dialog.hide();
                		})

			}
			else{


				frappe.db.insert({
					doctype           : 'Attendance' ,
					employee          : employee_id  ,
					attendance_date   : date         ,
					status            : 'Present'    ,
					custom_heure_nuit : values.heure_nuit ,
					working_hours     : values.heure_travaille,
					custom_department : values.type,
					custom_mission    : values.mission
				}).then(doc =>{

					start_work()
					dialog.hide();
				}).catch(error =>{
                	        	console.error("Failed to save the attendance" , error);
					dialog.hide();
                		})

			}


		}
	})



	return dialog

}



//create dialog for multi selection function

function create_multi_selection_dialog(){


    	//to get the value the user inter
	const [year , month] = document.getElementById('pointage_month').value.split('-').map(Number);


       	//month var is 0-indexed and when inter day as 0 it return the last day of the previous month  and since we inter the month not 0-indexed like jan ==> 1 so it will thought that 1 reffer to fiv and will return the last day in jav month.
	const daysInMonth = new Date(year, month, 0).getDate();


	data = mapping(all_employees , all_attendances);

	/******************  prepare the dialog  ********************/
	const dialog = new frappe.ui.Dialog({
		title  : 'Pointage',
		fields : [
			{
				label     : 'Heure travaillé (H)',
				fieldname : 'heure_travaille',
				fieldtype : 'Float',
				default   : 8,
				change(){
					const working_hours = dialog.get_value('heure_travaille')
					const heure_nuit    = dialog.get_value('heure_nuit')

					if(working_hours == 0 && heure_nuit == 0){
						dialog.set_df_property('motif_jour','hidden',0)
						dialog.set_value('motif_jour',"Congé sans solde")
						dialog.set_df_property('lieu','hidden',1)
						dialog.set_df_property('type','hidden',1)
					}
					else{
						dialog.set_df_property('motif_jour','hidden',1)
						dialog.set_df_property('lieu','hidden',0)
						dialog.set_df_property('type','hidden',0)
					}
				}
			},
			{
				label     : "Heure Nuit (H)",
				fieldname : "heure_nuit",
				fieldtype : 'Float',
				default   : 0.0,
				change(){
					const working_hours = dialog.get_value('heure_travaille')
					const heure_nuit    = dialog.get_value('heure_nuit')

					if(working_hours == 0 && heure_nuit == 0){
						dialog.set_df_property('motif_jour','hidden',0)
						dialog.set_value('motif_jour',"Congé sans solde")
						dialog.set_df_property('lieu','hidden',1)
						dialog.set_df_property('type','hidden',1)
					}
					else{
						dialog.set_df_property('motif_jour','hidden',1)
						dialog.set_df_property('lieu','hidden',0)
						dialog.set_df_property('type','hidden',0)
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
						dialog.set_df_property('type' , 'options' , projects_list)
						if(projects_list.length > 0){
							dialog.set_value('type' , projects_list[0])
						}
					}
					else{
						dialog.set_df_property('type' , 'label' , "Departement")
						dialog.set_df_property('type' , 'options' , departments_list)
						if(departments_list.length > 0){
							dialog.set_value('type' , departments_list[0])
						}
					}
					// Refresh the field to update the label
                			dialog.fields_dict.type.refresh();
				}
			},
			{
				label     : "Projet",
				fieldname : "type",
				fieldtype : "Select",
				options   : projects_list.map(proj => proj.project_name),
				default   : projects_list.length > 0 ? projects_list[0].project_name : "",
			},
			{
				label     : "Mission",
				fieldname : "mission",
				fieldtype : "Check"
			},
			{
                		label: "Motif jour",
                		fieldname: "motif_jour",
		                fieldtype: "Select",
                		options  : ["Congé sans solde","Congé annuel","Maladi","Récuperation","Non validée","Absence Autorisée","Absence non Autorisée","Férié","Chomé payé","Formation", "Autre"],
				hidden: 1 // Initially hidden
            		}
		],
		size  : 'small',
		primary_action_label :'Done',
		primary_action(values){


			const status = (values.heure_nuit ==0 && values.heure_travaille == 0) ? 'Absent' : 'Present'

			let count = 0 ;
			if(status == "Absent"){
				selected_box.forEach(item=>{
					console.log("this is for the date " , item.date)
					frappe.db.insert({
						doctype         : 'Attendance' ,
						employee        : item.employee_id  ,
						attendance_date : item.date         ,
						status          : status       ,
						custom_motif    : values.motif_jour
					}).then(doc =>{
						count += 1 ;
						if(count == selected_box.length){
							selected_box = [];
							fetchTableDataAndDrawIt();
							dialog.hide();
						}
					}).catch(error =>{
                	        		console.error("Failed to save the attendance" , error);
						dialog.hide();
                			})
				})

			}else if(values.lieu == "Projet"){
				selected_box.forEach(item =>{
					frappe.db.insert({
						doctype         : 'Attendance' ,
						employee        : item.employee_id  ,
						attendance_date : item.date         ,
						status          : status       ,
						custom_heure_nuit : values.heure_nuit ,
						working_hours     : values.heure_travaille,
						custom_project    : getProjectIdByName(values.type),
						custom_mission    : values.mission
					}).then(doc =>{
						count += 1 ;
						if(count == selected_box.length){
							selected_box = [];
							fetchTableDataAndDrawIt()
							dialog.hide();
						}
					}).catch(error =>{
                	        		console.error("Failed to save the attendance" , error);
						dialog.hide();
                			})
				})

			}
			else{

				selected_box.forEach(item =>{
					frappe.db.insert({
						doctype           : 'Attendance'      ,
						employee          : item.employee_id  ,
						attendance_date   : item.date         ,
						status            : status            ,
						custom_heure_nuit : values.heure_nuit ,
						working_hours     : values.heure_travaille,
						custom_department : values.type       ,
						custom_mission    : values.mission
					}).then(doc =>{
						count += 1 ;
						if(count == selected_box.length){
							selected_box = [];
							fetchTableDataAndDrawIt()
							dialog.hide();
						}
					}).catch(error =>{
                		        	console.error("Failed to save the attendance" , error);
						dialog.hide();
                		})

				})

			}


		}
	})



	return dialog

}






function setDefaultMonth(){

	//to get the value the user inter
	const monthInput = document.getElementById('pointage_month');

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
				heure_nuit    : attendanceRecord.custom_heure_nuit,
				project       : attendanceRecord.custom_project,
				department    : attendanceRecord.custom_department,
				motif         : attendanceRecord.custom_motif
			}
		}
	})



	return attendanceMap;
}




function getProjectIdByName( project_name){
	return projects_list.find(proj => proj.project_name === project_name).name
}



//item = {employee_id : "" , day : ""}
function selectItem(item){


	console.log("selected Item : " , item )

	const index = selected_box.findIndex(
        	box => (box.employee_id === item.employee_id && box.date === item.date)
	);

	if(index !== -1){
		console.log("we find it in : " , index)
		selected_box.splice(index,1);
	}
	else{
		selected_box.push(item);
	}

	console.log("selected Item After Click : " , selected_box)

}

function box_exist(item){

        const index = selected_box.findIndex(
                box => box.employee_id === item.employee_id && box.date === item.date
        );

	if(index !== -1){ return true  }
	else { return false  }
}
