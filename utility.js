//================================================================
// padString() pads a string with blanks up to the specified width. 
// If the item's length is larger than the width, the length of the 
// item will be truncated.
//================================================================
exports.padString = function(item, width)
{
    var str ="";
    str += item;

    if (str.length < width)
    {
      for (var i=str.length; i < width-str.length; i++)
        str += " ";
    }
    else 
    {
      str.length = width;
    }
    return str;
}