var curr_style = '64'
var boxes_visible = true
var choose_palette = false
var sidebar_hidden = false
var zoom_mode = false

var is_screen_small = window.matchMedia ? 
  window.matchMedia("screen and (max-width: 1000px)").matches : 
  screen.width <= 1000
var is_touch_device = 'ontouchstart' in window || navigator.msMaxTouchPoints > 0

var placeholder_img = "img/placeholder.png"
if (is_touch_device)
  placeholder_img = "img/placeholder_mobile.png"

function init()
{
  var table = document.getElementById("roster_tbl")
  var trs = table.firstElementChild.children
  for (var i = 0; i < trs.length; i++)
  {
    var tr = trs[i]
    var tds = tr.children
    for (var j = 0; j < tds.length; j++)
    {
      var td = tds[j]
      init_cell(td)
    }
  }

  if (is_screen_small)
  {
    toggle_nav()
  }

  // Detect if device is touch-enabled and if so, show zoom mode options
  if (is_touch_device)
  {
    document.getElementById("zoomoptions").style.display = "block"
  }
}

function init_cell(td)
{
  var div = document.createElement("div")
  if (is_touch_device)
    div.setAttribute("onclick", "add_img(this)")
  else
    div.setAttribute("ondblclick", "add_img(this)")
  div.setAttribute("onmousedown", "start_drag(event,this)")
  div.setAttribute("ontouchstart", "start_drag(event,this)")
  div.setAttribute("onmousemove", "continue_drag(event,this)")
  div.setAttribute("ontouchmove", "continue_drag(event,this)")
  div.setAttribute("onmouseup", "end_drag(event,this)")
  div.setAttribute("ontouchend", "end_drag(event,this)")
  div.style.background = "url(" + placeholder_img + ") 0px 0px/100% no-repeat"
  td.appendChild(div)
  var sp = document.createElement("span")
  sp.setAttribute("onclick", "document.execCommand('selectAll',false,null)")
  sp.setAttribute("spellcheck", "false")
  sp.setAttribute("contenteditable", "true")
  sp.setAttribute("onmousedown", "start_drag(event,this)")
  sp.setAttribute("ontouchstart", "start_drag(event,this)")
  sp.setAttribute("onmousemove", "continue_drag(event,this)")
  sp.setAttribute("ontouchmove", "continue_drag(event,this)")
  sp.setAttribute("onmouseup", "end_drag(event,this)")
  sp.setAttribute("ontouchend", "end_drag(event,this)")
  sp.innerHTML = "click me"
  td.appendChild(sp)
}

function toggle_nav()
{
  if (sidebar_hidden)
  {
    document.getElementById("main_div").style.width = "calc(100% - 300px)"
    document.getElementById("settings_div").style.right = "0"
    document.getElementById("toggle_btn").style.right = "280px"
    document.getElementById("toggle_btn").innerHTML = "&#x25b8;"
  }
  else
  {
    document.getElementById("main_div").style.width = "calc(100% - 20px)"
    document.getElementById("settings_div").style.right = "-280px"
    document.getElementById("toggle_btn").style.right = "5px"
    document.getElementById("toggle_btn").innerHTML = "&#x25c2;"
  }
  sidebar_hidden = !sidebar_hidden
}

function set_cell_to_dominant_color(td, img_src, allow_choose)
{
  var optsform = document.getElementById("customoptions")
  var image = document.createElement("img")
  image.setAttribute("src", img_src)
  image.onload = function() {
    var vibrant = new Vibrant(image)
    var swatches = vibrant.swatches()
    var new_color = swatches.hasOwnProperty("Vibrant") && swatches["Vibrant"] ? swatches["Vibrant"].getHex() : ""
    if (new_color === "")
    {
      for (var swatch in swatches)
      {
        if (swatches.hasOwnProperty(swatch) && swatches[swatch])
        {
          new_color = swatches[swatch].getHex()
          break
        }
      }
    }
    if (choose_palette && allow_choose)
    {
      popup_swatch_dialog(td, swatches)
    }
    else
    {
      switch (curr_style)
      {
        case 'sm4sh':
          td.style.background = new_color
          break
        case '3ds':
          td.style.background = "linear-gradient(to bottom, white, " + new_color + ")"
          break
        case 'custom':
          td.style.background = optsform.getElementsByTagName("input")[4].value.replace(/<auto>/g, new_color).replace(/<choose>/g, new_color)
          break
      }
    }
  }
}

function popup_swatch_dialog(td_original, swatches)
{
  var optsform = document.getElementById("customoptions")
  var dialog = document.getElementById("dialog")
  var label = document.createElement("label")
  label.innerHTML = "Choose a background color from the palettes below:"
  var table = document.createElement("table")
  table.setAttribute("cellspacing", "5")
  var tr = table.insertRow(-1)
  for (var swatch in swatches)
  {
    if (swatches.hasOwnProperty(swatch) && swatches[swatch])
    {
      var td = tr.insertCell(-1)
      var color = swatches[swatch].getHex()
      td.style.backgroundColor = color
      td.onclick = function() {
        switch (curr_style)
        {
          case 'sm4sh':
            td_original.style.background = this.style.backgroundColor
            break
          case '3ds':
            td_original.style.background = "linear-gradient(to bottom, white, " + this.style.backgroundColor + ")"
            break
          case 'custom':
            td_original.style.background = optsform.getElementsByTagName("input")[4].value.replace(/<auto>/g, this.style.backgroundColor).replace(/<choose>/g, this.style.backgroundColor)
            break
        }
        // Delete parts of the dialog and hide the popup
        document.getElementById("popup").style.visibility = "hidden"
        while (dialog.firstChild)
        {
          dialog.removeChild(dialog.firstChild)
        }
      }
    }
  }
  dialog.appendChild(label)
  dialog.appendChild(table)
  document.getElementById("popup").style.visibility = "visible"
}

function change_dims(isrows)
{
  var rostertbl = document.getElementById("roster_tbl")
  var rowbox = document.getElementById("num_rows")
  var colbox = document.getElementById("num_cols")

  // Validate input
  if (Number(rowbox.value) <= 0 || Number(colbox.value) <= 0 ||
      Number(rowbox.value) > 50 || Number(colbox.value) > 50)
    return

  if (isrows)
  {
    // Need to add a row if curr. length is less than in the box
    if (rostertbl.rows.length < Number(rowbox.value))
    {
      // Keep going until we have as many rows as the box says
      while (rostertbl.rows.length < Number(rowbox.value))
      {
        var r = rostertbl.insertRow(-1)
        for (var i = 0; i < Number(colbox.value); i++)
        {
          var c = r.insertCell(-1)
          init_cell(c)
        }
      }
    }
    else if (rostertbl.rows.length > Number(rowbox.value))
    {
      while (rostertbl.rows.length > Number(rowbox.value))
      {
        rostertbl.deleteRow(-1)
      }
    }
  }
  else
  {
    // Need to add a col if curr. length is less than in the box
    if (rostertbl.rows[0].cells.length < Number(colbox.value))
    {
      while (rostertbl.rows[0].cells.length < Number(colbox.value))
      {
        for (var i = 0; i < rostertbl.rows.length; i++)
        {
          var c = rostertbl.rows[i].insertCell(-1)
          init_cell(c)
        }
      }
    }
    else if (rostertbl.rows[0].cells.length > Number(colbox.value))
    {
      while (rostertbl.rows[0].cells.length > Number(colbox.value))
      {
        for (var i = 0; i < rostertbl.rows.length; i++)
        {
          rostertbl.rows[i].deleteCell(-1)
        }
      }
    }
  }

  change_theme(curr_style)
}

function change_theme(styl)
{
  var maindiv = document.getElementById("main_div")
  var table = document.getElementById("roster_tbl")
  var trs = table.firstElementChild.children
  var optsform = document.getElementById("customoptions")

  // Show and fill fields if we switched to custom from another style
  if (styl === "custom" && curr_style !== styl)
  {
    document.getElementById("customoptions").style.display = "block"
    // Also prepopulate fields with current style options
    optsform.getElementsByTagName("input")[0].value = maindiv.style.background
    optsform.getElementsByTagName("input")[1].value = table.style.background
    optsform.getElementsByTagName("input")[2].value = table.style.border
    optsform.getElementsByTagName("input")[3].value = table.getAttribute("cellspacing")
    optsform.getElementsByTagName("input")[4].value = trs[0].children[0].style.background
    optsform.getElementsByTagName("input")[5].value = trs[0].children[0].style.border
    optsform.getElementsByTagName("input")[6].value = trs[0].children[0].style.borderRadius
    optsform.getElementsByTagName("input")[7].value = trs[0].children[0].style.fontFamily
    optsform.getElementsByTagName("input")[8].value = trs[0].children[0].style.color
    optsform.getElementsByTagName("input")[9].value = trs[0].children[0].style.textAlign
    optsform.getElementsByTagName("input")[10].value = trs[0].children[0].getElementsByTagName("span")[0].style.textShadow
    optsform.getElementsByTagName("input")[11].value = trs[0].children[0].getElementsByTagName("span")[0].style.backgroundColor
    optsform.getElementsByTagName("input")[12].value = trs[0].children[0].getElementsByTagName("span")[0].style.borderRadius
    optsform.getElementsByTagName("input")[13].checked = trs[0].children[0].getElementsByTagName("span")[0].style.top === "0px"
    optsform.getElementsByTagName("input")[14].value = trs[0].children[0].getElementsByTagName("span")[0].style.height
    optsform.getElementsByTagName("input")[15].value = trs[0].children[0].getElementsByTagName("span")[0].style.fontSize
    optsform.getElementsByTagName("input")[16].value = trs[0].children[0].getElementsByTagName("div")[0].style.borderRadius
  }
  else if (styl !== "custom")
  {
    document.getElementById("customoptions").style.display = "none"
  }

  curr_style = styl

  // Show 3DS options if styl is 3ds, and revert palette selection to off
  if (curr_style === "3ds" || curr_style === "sm4sh")
  {
    document.getElementById("paletteoptions").style.display = "block"
  }
  else
  {
    document.getElementById("paletteoptions").style.display = "none"
  }
  document.getElementById("paletteoptions").getElementsByTagName("input")[1].checked = true
  choose_palette = false

  for (var i = 0; i < trs.length; i++)
  {
    var tr = trs[i]
    var tds = tr.children
    for (var j = 0; j < tds.length; j++)
    {
      var td = tds[j]
      // Individual cell settings
      switch (styl)
      {
        case '64':
          td.style.background = "radial-gradient(circle at bottom, #aa5002, #7d1900, #2d0002)"
          td.style.border = "1px #734d33 solid"
          td.style.borderRadius = "0px"
          td.style.fontFamily = "Jost, 'Century Gothic', sans-serif"
          td.style.color = "#a5a582"
          td.style.textAlign = "left"
          td.getElementsByTagName("span")[0].style.textShadow = "0 0 6px black, 0 0 6px black"
          td.getElementsByTagName("span")[0].style.background = "transparent"
          td.getElementsByTagName("span")[0].style.borderRadius = "0"
          td.getElementsByTagName("span")[0].style.top = "0"
          td.getElementsByTagName("span")[0].style.bottom = "auto"
          td.getElementsByTagName("span")[0].style.height = "20px"
          td.getElementsByTagName("span")[0].style.fontSize = "15px"
          td.getElementsByTagName("span")[0].style.lineHeight = "normal"
          td.getElementsByTagName("span")[0].style.letterSpacing = "0"
          td.getElementsByTagName("div")[0].style.borderRadius = "0"
          break
        case 'melee':
          td.style.background = "linear-gradient(to bottom, #28415a, #506982)"
          td.style.border = "2px #c6c6c6 solid"
          td.style.borderRadius = "10px"
          td.style.fontFamily = "'Melee CSS', 'Old Sans Black', 'Helvetica Black', 'Arial Black'"
          td.style.color = "#d6d6d6"
          td.style.textAlign = "center"
          td.getElementsByTagName("span")[0].style.textShadow = "none"
          td.getElementsByTagName("span")[0].style.background = "#200"
          td.getElementsByTagName("span")[0].style.borderRadius = "0px 0px 8px 8px"
          td.getElementsByTagName("span")[0].style.top = "auto"
          td.getElementsByTagName("span")[0].style.bottom = "0"
          td.getElementsByTagName("span")[0].style.height = "16px"
          td.getElementsByTagName("span")[0].style.fontSize = "12px"
          td.getElementsByTagName("span")[0].style.lineHeight = "16px"
          td.getElementsByTagName("span")[0].style.letterSpacing = "-1px"
          td.getElementsByTagName("div")[0].style.borderRadius = "8px"
          break
        case 'brawl':
          td.style.background = "linear-gradient(to bottom, #afd2dc, #78a5b4)"
          td.style.border = "2px #6a6a6a solid"
          td.style.borderRadius = "0px 0px 7px 0px"
          td.style.fontFamily = "'Arimo Bold', Helvetica, Arial, sans-serif"
          td.style.color = "#dcdcdc"
          td.style.textAlign = "center"
          td.getElementsByTagName("span")[0].style.textShadow = "none"
          td.getElementsByTagName("span")[0].style.background = "#232323"
          td.getElementsByTagName("span")[0].style.borderRadius = "0"
          td.getElementsByTagName("span")[0].style.top = "0"
          td.getElementsByTagName("span")[0].style.bottom = "auto"
          td.getElementsByTagName("span")[0].style.height = "17px"
          td.getElementsByTagName("span")[0].style.fontSize = "13px"
          td.getElementsByTagName("span")[0].style.lineHeight = "normal"
          td.getElementsByTagName("span")[0].style.letterSpacing = "0"
          td.getElementsByTagName("div")[0].style.borderRadius = "0px 0px 5px 0px"
          break
        case '3ds':
          re_match = /url\("(.*)"\)/g.exec(td.getElementsByTagName("div")[0].style.background)
          set_cell_to_dominant_color(td, re_match ? re_match[1] : placeholder_img, false)
          td.style.border = "0.5px black solid"
          td.style.borderRadius = "0px"
          td.style.fontFamily = "'Old Sans Black', 'Helvetica Black', 'Arial Black', sans-serif"
          td.style.color = "white"
          td.style.textAlign = "center"
          td.getElementsByTagName("span")[0].style.textShadow = "1px -1px 0 black, 0 -1px 0 black, -1px -1px 0 black, -1px 0 0 black, -1px 1px 0 black, 0 1px 0 black, 1px 1px 0 black, 1px 0 0 black"
          td.getElementsByTagName("span")[0].style.background = "transparent"
          td.getElementsByTagName("span")[0].style.borderRadius = "0"
          td.getElementsByTagName("span")[0].style.top = "auto"
          td.getElementsByTagName("span")[0].style.bottom = "0"
          td.getElementsByTagName("span")[0].style.height = "18px"
          td.getElementsByTagName("span")[0].style.fontSize = "14px"
          td.getElementsByTagName("span")[0].style.lineHeight = "normal"
          td.getElementsByTagName("span")[0].style.letterSpacing = "0"
          td.getElementsByTagName("div")[0].style.borderRadius = "0"
          break
        case 'wiiu':
          td.style.background = "none"
          td.style.border = "1px #1f1f1f solid"
          td.style.borderRadius = "0px"
          td.style.fontFamily = "'Old Sans Black', 'Helvetica Black', 'Arial Black', sans-serif"
          td.style.color = "white"
          td.style.textAlign = "center"
          td.getElementsByTagName("span")[0].style.textShadow = "1px -1px 0 black, 0 -1px 0 black, -1px -1px 0 black, -1px 0 0 black, -1px 1px 0 black, 0 1px 0 black, 1px 1px 0 black, 1px 0 0 black"
          td.getElementsByTagName("span")[0].style.background = "linear-gradient(to bottom, transparent, transparent 30%, #1f1f1f 30%, #1f1f1f"
          td.getElementsByTagName("span")[0].style.borderRadius = "0"
          td.getElementsByTagName("span")[0].style.top = "auto"
          td.getElementsByTagName("span")[0].style.bottom = "0"
          td.getElementsByTagName("span")[0].style.height = "18px"
          td.getElementsByTagName("span")[0].style.fontSize = "14px"
          td.getElementsByTagName("span")[0].style.lineHeight = "normal"
          td.getElementsByTagName("span")[0].style.letterSpacing = "0"
          td.getElementsByTagName("div")[0].style.borderRadius = "0"
          break
        case 'sm4sh':
          re_match = /url\("(.*)"\)/g.exec(td.getElementsByTagName("div")[0].style.background)
          set_cell_to_dominant_color(td, re_match ? re_match[1] : placeholder_img, false)
          td.style.border = "transparent"
          td.style.borderRadius = "0px"
          td.style.fontFamily = "'Open Sans Condensed', 'Century Gothic', sans-serif"
          td.style.color = "white"
          td.style.textAlign = "center"
          td.getElementsByTagName("span")[0].style.textShadow = "none"
          td.getElementsByTagName("span")[0].style.background = "#333"
          td.getElementsByTagName("span")[0].style.borderRadius = "0"
          td.getElementsByTagName("span")[0].style.top = "auto"
          td.getElementsByTagName("span")[0].style.bottom = "0"
          td.getElementsByTagName("span")[0].style.height = "20px"
          td.getElementsByTagName("span")[0].style.fontSize = "15px"
          td.getElementsByTagName("span")[0].style.lineHeight = "normal"
          td.getElementsByTagName("span")[0].style.letterSpacing = "0"
          td.getElementsByTagName("div")[0].style.borderRadius = "0"
          break
        case 'ult':
          td.style.background = "none"
          td.style.border = "1px #110f11 solid"
          td.style.borderRadius = "0px"
          td.style.fontFamily = "'Old Sans Black', 'Helvetica Black', 'Arial Black', sans-serif"
          td.style.color = "white"
          td.style.textAlign = "center"
          td.getElementsByTagName("span")[0].style.textShadow = "1px -1px 0 black, 0 -1px 0 black, -1px -1px 0 black, -1px 0 0 black, -1px 1px 0 black, 0 1px 0 black, 1px 1px 0 black, 1px 0 0 black, 2px 2px 0 black"
          td.getElementsByTagName("span")[0].style.background = "transparent"
          td.getElementsByTagName("span")[0].style.borderRadius = "0"
          td.getElementsByTagName("span")[0].style.top = "auto"
          td.getElementsByTagName("span")[0].style.bottom = "0"
          td.getElementsByTagName("span")[0].style.height = "18px"
          td.getElementsByTagName("span")[0].style.fontSize = "14px"
          td.getElementsByTagName("span")[0].style.lineHeight = "normal"
          td.getElementsByTagName("span")[0].style.letterSpacing = "0"
          td.getElementsByTagName("div")[0].style.borderRadius = "0"
          break
        case 'custom':
          if (optsform.getElementsByTagName("input")[4].value.includes("<auto>") || optsform.getElementsByTagName("input")[4].value.includes("<choose>"))
          {
            re_match = /url\("(.*)"\)/g.exec(td.getElementsByTagName("div")[0].style.background)
            set_cell_to_dominant_color(td, re_match ? re_match[1] : placeholder_img, false)
          }
          else
          {
            td.style.background = optsform.getElementsByTagName("input")[4].value
          }
          td.style.border = optsform.getElementsByTagName("input")[5].value
          td.style.borderRadius = optsform.getElementsByTagName("input")[6].value
          td.style.fontFamily = optsform.getElementsByTagName("input")[7].value
          td.style.color = optsform.getElementsByTagName("input")[8].value
          td.style.textAlign = optsform.getElementsByTagName("input")[9].value
          td.getElementsByTagName("span")[0].style.textShadow = optsform.getElementsByTagName("input")[10].value
          td.getElementsByTagName("span")[0].style.backgroundColor = optsform.getElementsByTagName("input")[11].value
          td.getElementsByTagName("span")[0].style.borderRadius = optsform.getElementsByTagName("input")[12].value
          if (optsform.getElementsByTagName("input")[13].checked)
          {
            td.getElementsByTagName("span")[0].style.top = "0"
            td.getElementsByTagName("span")[0].style.bottom = "auto"
          }
          else
          {
            td.getElementsByTagName("span")[0].style.top = "auto"
            td.getElementsByTagName("span")[0].style.bottom = "0"
          }
          td.getElementsByTagName("span")[0].style.height = optsform.getElementsByTagName("input")[14].value
          td.getElementsByTagName("span")[0].style.fontSize = optsform.getElementsByTagName("input")[15].value
          td.getElementsByTagName("span")[0].style.lineHeight = "normal"
          td.getElementsByTagName("span")[0].style.letterSpacing = "0"
          td.getElementsByTagName("div")[0].style.borderRadius = optsform.getElementsByTagName("input")[16].value
      }
      td.getElementsByTagName("span")[0].style.visibility = boxes_visible ? "visible" : "hidden" 
    }
  }
  // Global table settings
  switch (styl)
  {
    case '64':
      maindiv.style.background = "url(img/ssb64bg.jpg)"
      table.setAttribute("cellspacing", "0")
      table.style.background = "none"
      table.style.border = "1px #734d33 solid"
      break
    case 'melee':
      maindiv.style.background = "radial-gradient(circle, #000a18, #0f182a)"
      table.setAttribute("cellspacing", "3")
      table.style.background = "transparent"
      table.style.border = "none"
      break
    case 'brawl':
      maindiv.style.background = "#f9f5f2"
      table.setAttribute("cellspacing", "2")
      table.style.background = "transparent"
      table.style.border = "none"
      break
    case '3ds':
      maindiv.style.background = "black"
      table.setAttribute("cellspacing", "0")
      table.style.background = "none"
      table.style.border = "none"
      break
    case 'wiiu':
      maindiv.style.background = "#1f1f1f"
      table.setAttribute("cellspacing", "0")
      table.style.background = "url(img/ssbwubg.jpg)"
      table.style.backgroundSize = "100% 100%"
      table.style.border = "1px #1f1f1f solid"
      break
    case 'sm4sh':
      maindiv.style.background = "#f7f7f7"
      table.setAttribute("cellspacing", "4")
      table.style.background = "none"
      table.style.border = "none"
      break
    case 'ult':
      maindiv.style.background = "url(img/ssbubbg.jpg)"
      table.setAttribute("cellspacing", "0")
      table.style.background = "url(img/ssbubg.jpg)"
      table.style.backgroundSize = "100% 100%"
      table.style.border = "1px #110f11 solid"
      break
    case 'custom':
      maindiv.style.background = optsform.getElementsByTagName("input")[0].value
      table.style.background = optsform.getElementsByTagName("input")[1].value
      table.style.border = optsform.getElementsByTagName("input")[2].value
      table.setAttribute("cellspacing", optsform.getElementsByTagName("input")[3].value)
      break
  }

  if (optsform.getElementsByTagName("input")[4].value.includes("<choose>"))
  {
    choose_palette = true
  }
}

function change_box_visibility(visible)
{
  var maindiv = document.getElementById("main_div")
  var table = document.getElementById("roster_tbl")
  var trs = table.firstElementChild.children
  for (var i = 0; i < trs.length; i++)
  {
    var tr = trs[i]
    var tds = tr.children
    for (var j = 0; j < tds.length; j++)
    {
      var span = tds[j].getElementsByTagName("span")[0]
      span.style.visibility = visible ? "visible" : "hidden"
    }
  }
  boxes_visible = visible
}

function change_palette_selection(choice)
{
  choose_palette = choice
}

var div_change = 0

function add_img(div)
{
  div_change = div
  var fi = document.getElementById("fileinput")
  fi.click()
}

function add_img_handler(fi)
{
  var optsform = document.getElementById("customoptions")
  if (div_change)
  {
    var img_url = URL.createObjectURL(fi.files[0])
    if (choose_palette || curr_style === "3ds" || curr_style === "sm4sh" || optsform.getElementsByTagName("input")[4].value.includes("<auto>"))
    {
      set_cell_to_dominant_color(div_change.parentElement, img_url, true)
    }
    div_change.style.background = "url(" + img_url + ")"
    div_change.style.backgroundSize = "100% auto"
    div_change.style.backgroundPosition = "0px 0px"
    div_change.style.backgroundRepeat = "no-repeat"
    fi.value = ""
  }
}

var initX = 0, initY = 0, init_zoom = 100, init_spacing = 0, drag = false, zoom = false, el_dragging = 0

function start_drag(evt, el)
{
  var evtX, evtY
  if (evt.type == "touchstart")
  {
    evtX = evt.touches[0].clientX
    evtY = evt.touches[0].clientY
  }
  else
  {
    evtX = evt.x
    evtY = evt.y
  }

  if (el.tagName === "DIV")
  {
    // Right click will initiate zoom, otherwise just drag image...
    // unless zoom mode is on
    zoom = evt.which === 3 || zoom_mode

    // Need to get the current offset so that the drag doesn't recenter the photo
    if (el.style.backgroundPosition)
    {
      var prev_offset = el.style.backgroundPosition.split(" ")
      var prevX = Number(prev_offset[0].slice(0, -2))
      var prevY = Number(prev_offset[1].slice(0, -2))
    }
    else
    {
      var prevX = 0, prevY = 0
    }
    initX = zoom ? evtX : evtX - prevX
    initY = zoom ? evtY : evtY - prevY
    init_zoom = el.style.backgroundSize ? Number(el.style.backgroundSize.substr(0, el.style.backgroundSize.indexOf('%'))) : 100
    el_dragging = el
    drag = true
  }
  else if (el.tagName === "SPAN")
  {
    // Right click or touch will initiate letter spacing drag
    if (evt.type == "mousedown")
      drag = evt.which === 3
    else
      drag = true
    if (drag)
    {
      initX = evtX
      initY = evtY
      init_spacing = el.style.letterSpacing ? Number(el.style.letterSpacing.substr(0, el.style.letterSpacing.indexOf("px"))) : 0
      el_dragging = el
    }
  }
}

function continue_drag(evt, el)
{
  var evtX, evtY
  if (evt.type == "touchmove")
  {
    evt.preventDefault()
    evt.stopPropagation()
    evtX = evt.touches[0].clientX
    evtY = evt.touches[0].clientY
  }
  else
  {
    evtX = evt.x
    evtY = evt.y
  }

  if (el.tagName === "DIV")
  {
    if (zoom && drag && el === el_dragging)
    {
      var diffX = evtX - initX
      el.style.backgroundSize = (init_zoom + diffX) + "%"
    }
    else if (drag && el === el_dragging)
    {
      var diffX = evtX - initX
      var diffY = evtY - initY
      el.style.backgroundPosition = diffX + "px " + diffY + "px"
    }
  }
  else if (el.tagName === "SPAN")
  {
    if (drag && el === el_dragging)
    {
      var diffX = evtX - initX
      el.style.letterSpacing = (init_spacing + Math.floor(diffX / 5)*0.5) + "px"
    }
  }
}

function end_drag(evt, el)
{
  if (evt !== undefined)
    continue_drag(evt, el)
  drag = false
  zoom = false
}

function toggle_zoom(chkbox)
{
  zoom_mode = chkbox.checked
}

function stop_context(evt)
{
  if (evt.button === 3)
  {
    evt.preventDefault()
    evt.stopPropagation()
    return false
  }
}

function save_roster()
{
  document.getElementById("save_wrapper").style.background = document.getElementById("main_div").style.background
  html2canvas(document.querySelector("#save_wrapper")).then(canvas => {
    if (is_touch_device)
    {
      popup_save_dialog(canvas.toDataURL("image/png"))
    }
    else
    {
      var link = document.getElementById("downloadlink")
      link.setAttribute("download", "myroster.png")
      link.setAttribute("href", canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"))
      link.click()
    }
    document.getElementById("save_wrapper").style.background = "none"
  })
}

function popup_save_dialog(dataURL)
{
  var dialog = document.getElementById("dialog")
  var label = document.createElement("label")
  label.innerHTML = "Save the image below!"
  var img = document.createElement("img")
  img.setAttribute("src", dataURL)
  var link = document.createElement("a")
  link.innerHTML = "Close"
  link.onclick = function() {
    // Delete parts of the dialog and hide the popup
    document.getElementById("popup").style.visibility = "hidden"
    while (dialog.firstChild)
    {
      dialog.removeChild(dialog.firstChild)
    }
  }
  dialog.appendChild(label)
  dialog.appendChild(img)
  dialog.appendChild(link)
  document.getElementById("popup").style.visibility = "visible"
}

// defer attr. required for this to work without document.onload
init()
change_theme('64')