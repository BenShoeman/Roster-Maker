var curr_style = '64'
var boxes_visible = true
var choose_palette = false

// NOTE: WORKS ONLY IN FIREFOX WHEN USED AS LOCAL FILE
// Will work when used as web server, e.g. Electron
// requires js/vibrant.js to be loaded
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
  if (isrows)
  {
    // Need to add a row if curr. length is less than in the box
    if (rostertbl.rows.length < Number(rowbox.value))
    {
      var r = rostertbl.insertRow(-1)
      for (var i = 0; i < Number(colbox.value); i++)
      {
        var c = r.insertCell(-1)
        var div = document.createElement("div")
        div.setAttribute("ondblclick", "add_img(this)")
        div.setAttribute("onmousedown", "start_drag(event,this)")
        div.setAttribute("onmousemove", "continue_drag(event,this)")
        div.setAttribute("onmouseup", "end_drag(event,this)")
        c.appendChild(div)
        var sp = document.createElement("span")
        sp.setAttribute("onclick", "document.execCommand('selectAll',false,null)")
        sp.setAttribute("spellcheck", "false")
        sp.setAttribute("contenteditable", "true")
        sp.setAttribute("onmousedown", "start_drag(event,this)")
        sp.setAttribute("onmousemove", "continue_drag(event,this)")
        sp.setAttribute("onmouseup", "end_drag(event,this)")
        sp.innerHTML = "click me"
        c.appendChild(sp)
      }
    }
    else
    {
      rostertbl.deleteRow(-1)
    }
  }
  else
  {
    // Need to add a col if curr. length is less than in the box
    if (rostertbl.rows[0].cells.length < Number(colbox.value))
    {
      for (var i = 0; i < rostertbl.rows.length; i++)
      {
        var c = rostertbl.rows[i].insertCell(-1)
        var div = document.createElement("div")
        div.setAttribute("ondblclick", "add_img(this)")
        div.setAttribute("onmousedown", "start_drag(event,this)")
        div.setAttribute("onmousemove", "continue_drag(event,this)")
        div.setAttribute("onmouseup", "end_drag(event,this)")
        c.appendChild(div)
        var sp = document.createElement("span")
        sp.setAttribute("onclick", "document.execCommand('selectAll',false,null)")
        sp.setAttribute("spellcheck", "false")
        sp.setAttribute("contenteditable", "true")
        sp.setAttribute("onmousedown", "start_drag(event,this)")
        sp.setAttribute("onmousemove", "continue_drag(event,this)")
        sp.setAttribute("onmouseup", "end_drag(event,this)")
        sp.innerHTML = "click me"
        c.appendChild(sp)
      }
    }
    else
    {
      for (var i = 0; i < rostertbl.rows.length; i++)
      {
        rostertbl.rows[i].deleteCell(-1)
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
          td.getElementsByTagName("span")[0].style.height = "0.5cm"
          td.getElementsByTagName("span")[0].style.fontSize = "0.4cm"
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
          td.getElementsByTagName("span")[0].style.background = "#280505"
          td.getElementsByTagName("span")[0].style.borderRadius = "0px 0px 8px 8px"
          td.getElementsByTagName("span")[0].style.top = "auto"
          td.getElementsByTagName("span")[0].style.bottom = "0"
          td.getElementsByTagName("span")[0].style.height = "0.375cm"
          td.getElementsByTagName("span")[0].style.fontSize = "0.3cm"
          td.getElementsByTagName("span")[0].style.lineHeight = "0.4cm"
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
          td.getElementsByTagName("span")[0].style.height = "0.45cm"
          td.getElementsByTagName("span")[0].style.fontSize = "0.36cm"
          td.getElementsByTagName("span")[0].style.lineHeight = "normal"
          td.getElementsByTagName("span")[0].style.letterSpacing = "0"
          td.getElementsByTagName("div")[0].style.borderRadius = "0px 0px 5px 0px"
          break
        case 'sm4sh':
          re_match = /url\("(.*)"\)/g.exec(td.getElementsByTagName("div")[0].style.background)
          set_cell_to_dominant_color(td, re_match ? re_match[1] : "img/placeholder.png", false)
          td.style.border = "none"
          td.style.borderRadius = "0px"
          td.style.borderBottom = "1.5px #c5c5c5 solid"
          td.style.borderRight = "1.5px #c5c5c5 solid"
          td.style.fontFamily = "'Open Sans Condensed', 'Century Gothic', sans-serif"
          td.style.color = "white"
          td.style.textAlign = "center"
          td.getElementsByTagName("span")[0].style.textShadow = "none"
          td.getElementsByTagName("span")[0].style.background = "#333"
          td.getElementsByTagName("span")[0].style.borderRadius = "0"
          td.getElementsByTagName("span")[0].style.top = "auto"
          td.getElementsByTagName("span")[0].style.bottom = "0"
          td.getElementsByTagName("span")[0].style.height = "0.55cm"
          td.getElementsByTagName("span")[0].style.fontSize = "0.4cm"
          td.getElementsByTagName("span")[0].style.lineHeight = "normal"
          td.getElementsByTagName("span")[0].style.letterSpacing = "0"
          td.getElementsByTagName("div")[0].style.borderRadius = "0"
          break
        case '3ds':
          re_match = /url\("(.*)"\)/g.exec(td.getElementsByTagName("div")[0].style.background)
          set_cell_to_dominant_color(td, re_match ? re_match[1] : "img/placeholder.png", false)
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
          td.getElementsByTagName("span")[0].style.height = "0.45cm"
          td.getElementsByTagName("span")[0].style.fontSize = "0.35cm"
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
          // td.getElementsByTagName("span")[0].style.textShadow = "0 0 6px black"
          td.getElementsByTagName("span")[0].style.textShadow = "1px -1px 0 black, 0 -1px 0 black, -1px -1px 0 black, -1px 0 0 black, -1px 1px 0 black, 0 1px 0 black, 1px 1px 0 black, 1px 0 0 black"
          // td.getElementsByTagName("span")[0].style.background = "#1f1f1f"
          td.getElementsByTagName("span")[0].style.background = "linear-gradient(to bottom, transparent, transparent 20%, #1f1f1f 20%, #1f1f1f"
          td.getElementsByTagName("span")[0].style.borderRadius = "0"
          td.getElementsByTagName("span")[0].style.top = "auto"
          td.getElementsByTagName("span")[0].style.bottom = "0"
          td.getElementsByTagName("span")[0].style.height = "0.45cm"
          td.getElementsByTagName("span")[0].style.fontSize = "0.35cm"
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
          td.getElementsByTagName("span")[0].style.height = "0.45cm"
          td.getElementsByTagName("span")[0].style.fontSize = "0.35cm"
          td.getElementsByTagName("span")[0].style.lineHeight = "normal"
          td.getElementsByTagName("span")[0].style.letterSpacing = "0"
          td.getElementsByTagName("div")[0].style.borderRadius = "0"
          break
        case 'custom':
          if (optsform.getElementsByTagName("input")[4].value.includes("<auto>") || optsform.getElementsByTagName("input")[4].value.includes("<choose>"))
          {
            re_match = /url\("(.*)"\)/g.exec(td.getElementsByTagName("div")[0].style.background)
            set_cell_to_dominant_color(td, re_match ? re_match[1] : "img/placeholder.png", false)
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
      table.style.background = "none"
      table.style.border = "none"
      break
    case 'brawl':
      maindiv.style.background = "#f9f5f2"
      table.setAttribute("cellspacing", "2")
      table.style.background = "none"
      table.style.border = "none"
      break
    case 'sm4sh':
      maindiv.style.background = "#f7f7f7"
      table.setAttribute("cellspacing", "4")
      table.style.background = "none"
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
  if (el.tagName === "DIV")
  {
    // Right click will initiate zoom, otherwise just drag image
    zoom = evt.which === 3

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
    initX = zoom ? evt.x : evt.x - prevX
    initY = zoom ? evt.y : evt.y - prevY
    init_zoom = el.style.backgroundSize ? Number(el.style.backgroundSize.substr(0, el.style.backgroundSize.indexOf('%'))) : 100
    el_dragging = el
    drag = true
  }
  else if (el.tagName === "SPAN")
  {
    // Right click will initiate letter spacing drag
    drag = evt.which === 3
    if (drag)
    {
      initX = evt.x
      initY = evt.y
      init_spacing = el.style.letterSpacing ? Number(el.style.letterSpacing.substr(0, el.style.letterSpacing.indexOf("px"))) : 0
      el_dragging = el
    }
  }
}

function continue_drag(evt, el)
{
  if (el.tagName === "DIV")
  {
    if (zoom && drag && el === el_dragging)
    {
      var diffX = evt.x - initX
      el.style.backgroundSize = (init_zoom + diffX) + "%"
    }
    else if (drag && el === el_dragging)
    {
      var diffX = evt.x - initX
      var diffY = evt.y - initY
      el.style.backgroundPosition = diffX + "px " + diffY + "px"
    }
  }
  else if (el.tagName === "SPAN")
  {
    if (drag && el === el_dragging)
    {
      var diffX = evt.x - initX
      el.style.letterSpacing = (init_spacing + Math.floor(diffX / 5)*0.5) + "px"
    }
  }
}

function end_drag(evt, el)
{
  continue_drag(evt, el)
  drag = false
  zoom = false
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

change_theme('64')