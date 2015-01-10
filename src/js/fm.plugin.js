/**
 * Created by alex on 20.12.14.
 */
(function(){
    tinymce.PluginManager.add('fm',function(editor){
        var options = editor.settings.fm_options;
        editor.addButton('FileManager',{
            text: 'Управление файлами',
            icon: false,
            onclick: function(){
                $.ajax({
                    url:  options.path + '/templates/fmModal.html',
                    success: function(html){
                        var element = $(html);
                        fileManager(element[0], editor, {}, options);
                        element.modal();

                    }
                });
            }
        });
    });
}());