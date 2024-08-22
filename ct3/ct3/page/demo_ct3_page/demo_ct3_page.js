frappe.pages['demo-ct3-page'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'demo page',
		single_column: true
	});


	let $btn = page.set_primary_action('Primery Action!' , ()=>frappe.msgprint("clicked primery") );
	let $btnOne = page.set_secondary_action('Second Action' , () => frappe.msgprint("clicked second"));

	page.add_menu_item('item1' , ()=> frappe.msgprint("click item1"));

	page.add_action_item('action1' , ()=> frappe.msgprint("action1 clicked"))

	let field = page.add_field ({
		label: 'Status',
		fieldtype: 'Select',
		fieldname: 'status',
		options:[
			'Open',
			'Succes',
			'Cancelled'
		],
		change(){
			let indicator_color;
			let value = field.get_value()
			//frappe.msgprint(value)

			if(value == 'Cancelled'){
				page.set_indicator(value , "gray")
			}
			else if(value == 'Open'){
				page.set_indicator(value , "blue")
			}
			else if(value == 'Succes'){
				page.set_indicator(value , "green")
			}

//			switch(field.get_value()){
//				case 'Open':
//					frappe.msgprint(fild.get_value());
//					indicator_color = 'blue';
//					indicator_label = 'Open';
//					break;
//                                case 'Close':
//					frappe.msgprint(fild.get_value());
//                                        indicator_color = 'Green';
//                                        indicator_label = 'Close';
//                                        break;
//                                case 'Cancelled':
//					frappe.msgprint(fild.get_value());
//                                        indicator_color = 'Gray';
//                                        indicator_label = 'Cancelled';
//                                        break;
//                                default:
//					frappe.msgprint(fild.get_value());
//                                        indicator_color = 'Black';
//                                        indicator_label = 'Unknown';
//      			}
//			page.set_indicator(indicator_label , indicator_color)

		}
	});
}
