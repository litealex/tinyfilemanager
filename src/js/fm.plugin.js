/**
 * Created by alex on 20.12.14.
 */
(function(){
    tinymce.PluginManager.add('fm',function(editor){
        editor.addButton('FileManager',{
            text: 'Управление файлами',
            icon: false,
            onclick: function(){
                $.ajax({
                    url: editor.settings.external_filemanager_path + '/src/templates/fmModal.html',
                    success: function(html){
                        var element = $(html);
                        fileManager(element[0], editor, {});
                        element.modal();
                    }
                });
            }
        });
    });
}());