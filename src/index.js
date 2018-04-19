import vTableGrid from './vTableGrid';

const Plugin = {
    install(Vue, options = {}){
        if(!vTableGrid.methods.dataLoad){
            console.warn('v-tablegrid plugin "dataLoad" function has not initialization, if you using server side data source for v-tablegrid, you have to ')
        }
        Vue.component(vTableGrid.name, vTableGrid);
    },
    /**
     * vTableGrid server side data load adapter set
     */
    dataLoad(adapter){
        if(adapter && typeof(adapter) === 'function')
            vTableGrid.methods.dataLoad = adapter;
    }
};

export default Plugin;