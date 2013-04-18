jQuery(function($) {

	function appendCombobox( provinsi, cb, callback ) {
		console.log('appendCombobox', 'provinsi', provinsi)
		
		$.getJSON( jne_params.ajaxurl,
			{ action:'JNE-ajax', nonce:jne_params.ajaxJNENonce, get:'kota', provinsi:provinsi }, 
			function( jsonKota ){
				console.log('appendCombobox', 'jsonKota', jsonKota)
				
				cb.html( '<option value="">' + woocommerce_params.i18n_select_state_text + '</option>' )
				//cb.html( '<option value="">Select a city...</option>' )
			
				$.each( jsonKota.data, function (key, cat) {
					// create group
					var group = $('<optgroup>', { label:key })
					// option combobox kota
					$.each(cat,function(i,item) {
						$("<option/>",{ value:item.index, text:item.nama }).appendTo( group )
					});					
					// add to group
					group.appendTo( cb )
				});			
				
				callback()
			} 
		)
	}
	
	/* ====================================== CART ====================================== */
	
	// cookie
	// https://github.com/carhartl/jquery-cookie
	var chosen_shipping_city = $.cookie("chosen_shipping_city") 
	
	$('select#calc_shipping_state').live('change', function(){
		var country  	 = $('select.country_to_state').val(),	
			provinsi 	 = $(this).val(),
			parent_state = $(this).parents('p'),
			combobox_city  = $('select#calc_shipping_city')
			
		if( jne_params.woocommerce.jne_is_enabled && 
			( country != 'ID' || !provinsi ) )
			return
		
		// sudah ada element combobox city
		if( combobox_city.length )
		{
			// kosongkan cb city
			combobox_city.empty()
			// set loading ala woocommerce
			combobox_city
				.parent()
				.block({
					message:null, 
					overlayCSS: {
						background: '#fff url(' + woocommerce_params.plugin_url + '/assets/images/ajax-loader.gif) no-repeat center', 
						opacity: 0.6
					}
				})
		} 
		// buat element combobox city
		else 
		{
			// buat element combobox
			var el = '<p class="form-row form-row-wide"><select name="calc_shipping_city" id="calc_shipping_city"></select></p>'	
			// letakkan setelah parent cb state
			parent_state.after( '<div class="clear"></div>' + el )
			combobox_city = $('select#calc_shipping_city')
			// set loading ala woocommerce
			combobox_city
				.parent()
				.block({
					message:null, 
					overlayCSS: {
						background: '#fff url(' + woocommerce_params.plugin_url + '/assets/images/ajax-loader.gif) no-repeat center', 
						opacity: 0.6
					}
				})
		}
		
		appendCombobox( provinsi, combobox_city, function(){
			combobox_city.parent().unblock()
			// set selected
			var value = chosen_shipping_city
			if( !chosen_shipping_city && jne_params.woocommerce.chosen_shipping_city ){
				var date = new Date();
				date.setTime(date.getTime() + (30 * 60 * 1000));
				$.cookie("chosen_shipping_city", jne_params.woocommerce.chosen_shipping_city, { expires:date, path:'/' });
				value = jne_params.woocommerce.chosen_shipping_city
			}
			console.log(value)
			if( value ) combobox_city.val( value )
		})
	})
	
	// set cookie saat submit
	$('form.shipping_calculator').submit(function(){
		var city = $('select#calc_shipping_city').val()
		if( city )
		{
			// set cookie 30 menit
			var date = new Date();
			date.setTime(date.getTime() + (30 * 60 * 1000));
			// across pages
			$.cookie("chosen_shipping_city", city, { expires:date, path:'/' });
		}
		
		console.log('chosen_shipping_city', $.cookie("chosen_shipping_city") )
		
	})
		
	if( $('select#calc_shipping_state').length ) $('select#calc_shipping_state').trigger('change')	
	
	/* ====================================== CHECKOUT ====================================== */
	
	// style combobox ala woocommerce dgn chosen
	if ( woocommerce_params.is_checkout == 1 ) $('select#billing_city, select#shipping_city').chosen()
	
	// aksi combobox pilih state pd checkout
	$('select#billing_state, select#shipping_state').live('change', function(){
		var country  	= $('#billing_country').val(),	
			provinsi 	= $(this).val(),
			field	 	= $(this).attr('id').split('_')[0],
			cbCity 		= $('#' + field + '_city'),
			cbParent	= cbCity.parent()
			
		console.log('country', country)
		console.log('provinsi', provinsi, 'field', field)
		console.log('cbCity', cbCity)
		console.log('cbParent', cbParent)
	
		if ( jne_params.woocommerce.jne_is_enabled && 
			( country != 'ID' || !provinsi ) )
			return
		
		// kosongkan combobox
		cbCity.empty()
		// set loading ala woocommerce
		cbParent.block({
			message:null, 
			overlayCSS: {
				background: '#fff url(' + woocommerce_params.plugin_url + '/assets/images/ajax-loader.gif) no-repeat center', 
				opacity: 0.6
			}}
		)
		
		appendCombobox( provinsi, cbCity, function(){	
			// set value
			var city = $.cookie("chosen_shipping_city") 
			if( city ) cbCity.val(city)
			// set update list
			cbCity.chosen().trigger("liszt:updated");
			// unblock parent
			cbParent.unblock();
		})		
	})
	
	if( $('select#billing_state').length ) $('select#billing_state').trigger('change')
	//if( $('select#shipping_state').length ) $('select#shipping_state').trigger('change')
	
	/*
	 * Ship to billing address
	 * 
	 * atau pengiriman ke billing address
	 * kosongkan combobox shipping state dan shipping city
	 *
	 */	 
		   
	$('#shiptobilling-checkbox').change(function(e){
		if( e.target.checked )
		{
			var cb_ship_state = $('#shipping_state'),
				 cb_ship_city = $('#shipping_city');
			// shipping state
			cb_ship_state.val('')
						 .chosen().trigger("liszt:updated")
			// shipping city
			cb_ship_city.val('')
						.chosen().trigger("liszt:updated")
						
			var billing_city = $('select#billing_city');
			if( billing_city.length && billing_city.val() != '' ) billing_city.trigger('change')
		}
	})
})