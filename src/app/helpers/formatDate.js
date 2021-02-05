 let formatDate = function(date = new Date(), locale = "es-GT", options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }){
    // gets date, locale? and options? parameters and returns formatted date
    let dateObject = new Date(date);
    if(options.hour || options.minute || options.second){
        return dateObject.toLocaleTimeString(locale, options)
    }else{
        return dateObject.toLocaleString(locale, options)
    }
}

export default formatDate;