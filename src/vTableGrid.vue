<template>
    <div>
        <table class="table table-striped table-bordered vTableGrid">
            <thead v-show="config.pCheck !== false">
                <tr>
                    <th>Select</th>
                    <th v-for="col,index in config.columns"
                        @click="sortChange(col.data, index)"
                        :class="{
                            sorting: config.pSorting,
                            sorting_asc: config.pSorting && sortIndex === index && sortOrder === 'asc',
                            sorting_desc: config.pSorting && sortIndex === index && sortOrder === 'desc'
                        }"
                        :column="col.data">{{col.title}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row,index in dataRows" @click="rowClick(index)" :class="{'row-selected':selectedIndex.includes(index)}">
                    <td>
                        <input type="checkbox" :checked="selectedIndex.includes(index)">
                    </td>
                    <td v-for="cell in config.columns"
                        v-html="(cell.render && typeof(cell.render) === 'function') ? cell.render(row[cell.data], row) : row[cell.data]" ></td>
                </tr>
            </tbody>
        </table>
        <v-page :setting="pageSetting" @page-change="pageChange" v-if="config.pPagination" ></v-page>
    </div>
</template>

<script>
    import constants from './constants';
    let {defaults, con} = constants;
    export default {
        name: "v-tablegrid",
        props:['setting'],
        data(){
            let config = Object.assign({}, defaults, this.setting);
            return {
                dataRows:[],
                pageSetting: {
                    totalRow:0
                },
                con: con,

                config: config,
                sortIndex: -1,
                sortColumn: '',
                sortOrder: '',
                queryParams: config.params || {},

                currentIndex: -1,
                selectedIndex: [],
                pageNumber: -1,
                pageSize: -1
            }
        },
        watch:{
            'setting.state.reload': function(val){
                if(val){
                    this.populate();
                }
            },
            'setting.params':{
                handler(val){
                    this.queryParams = val;
                    this.pageNumber = 1;
                    this.populate();
                },
                deep: true
            }
        },
        methods:{
            /**
             * Table data loading method
             * required init in plugin install
             *
             * @param data - json data source or server side url
             * @param params - query parameters
             */
            dataLoad: false,
            /**
             * update data to table
             * @param values - server side return data
             */
            dataRender(values){
                if(values &&
                    typeof(values.gridResult) !== 'undefined' &&
                    typeof(values.gridResult.list) !== 'undefined'){
                    this.dataRows = values.gridResult.list;
                    this.pageSetting.totalRow = values.gridResult.totalRow;
                }
            },
            /**
             * Load table data
             */
            populate(){
                let that = this, params = {};
                if(typeof(this.config.data) === 'string'){
                    //sort parameters set
                    if(this.config.pSorting && this.sortColumn){
                        params.sortName = this.sortColumn;
                        params.sortOrder = this.sortOrder ? this.sortOrder : con.orderAsc;
                    }
                    //page parameters set
                    if(this.pageNumber !== -1) params.pageNumber = this.pageNumber;
                    if(this.pageSize !== -1) params.pageSize = this.pageSize;

                    if(this.queryParams && Object.keys(this.queryParams).length)
                        params = Object.assign({}, params, this.queryParams);

                    if(this.dataLoad)
                        this.dataLoad(this.config.data, params).then(function(values){
                            that.dataRender(values);
                            if(typeof(that.setting.state)!=='undefined' && typeof(that.setting.state.reload)!=='undefined')
                                that.setting.state.reload = false;
                        });
                }else if(typeof(this.config.data) === 'object'){
                    this.dataRender(this.config.data);
                }
            },
            /**
             * Receive page switch and do request
             * @param pInfo - page switch info
             */
            pageChange(pInfo){
                if(pInfo && Object.keys(pInfo).length){
                    this.pageNumber = pInfo.pageNumber;
                    this.pageSize = pInfo.pageSize;
                    this.populate();
                }
            },
            /**
             * Column sort change
             * @param column
             * @param index
             */
            sortChange(column, index){
                if(!this.config.pSorting) return;
                this.sortColumn = column;
                if(this.sortIndex === index) {//sorting
                    if(!this.sortOrder || this.sortOrder === con.orderDesc)
                        this.sortOrder = con.orderAsc;
                    else if(this.sortOrder === con.orderAsc)
                        this.sortOrder = con.orderDesc;
                }else{
                    this.sortIndex = index;
                    this.sortOrder = con.orderAsc;
                }
            },
            /**
             * Table row click
             * @param index
             */
            rowClick(index){
                if(!this.config.pCheck) return;
                let that = this;

                if(!this.selectedIndex.includes(index)){
                    if(this.config.pCheck === con.checkSingle)
                        this.selectedIndex.splice(0, this.selectedIndex.length);
                    this.selectedIndex.push(index);
                } else{
                    let idx = this.selectedIndex.findIndex( (value)=> value === index );
                    this.selectedIndex.splice(idx, 1);
                }
                this.currentIndex = index;
                this.$emit('eClick', this.dataRows.filter( (val, idx) => that.selectedIndex.includes(idx) ));
            }
        },
        mounted(){
            if(!this.config.pPagination) this.populate();
        }
    }
</script>

<style lang="scss" scoped>
    $borderColor : #DDDDDD;
    $borderRadius: 2px;
    table.vTableGrid {
        clear: both;
        margin-top: 6px !important;
        margin-bottom: 6px !important;
        max-width: none !important;
        border-collapse: separate !important;
        border-color: $borderColor;
        td,th {
            -webkit-box-sizing: content-box;
            box-sizing: content-box;
        }
        td.vTableGrid_empty,th.vTableGrid_empty{ text-align: center; }
        &.nowrap th,&.nowrap td{ white-space: nowrap; }

        thead {
            & > tr {
                & > th {
                    -moz-user-select: none;
                    -khtml-user-select: none;
                    user-select: none;
                    &:first-child { border-top-left-radius: $borderRadius; }
                    &:last-child { border-top-right-radius: $borderRadius; }
                }
                & > th, & > td {
                    color: black;
                    font-weight: 600;
                }
                & > th.sorting_asc, & > th.sorting_desc, & > th.sorting,
                & > td.sorting_asc,
                & > td.sorting_desc,
                & > td.sorting { padding-right: 30px; }
                & > th:active, & > td:active { outline: none; }
            }
            .sorting,
            .sorting_asc,
            .sorting_desc,
            .sorting_asc_disabled,
            .sorting_desc_disabled { cursor: pointer;position: relative; }
            .sorting:after,
            .sorting_asc:after,
            .sorting_desc:after,
            .sorting_asc_disabled:after,
            .sorting_desc_disabled:after {
                position: absolute;
                bottom: 8px;
                right: 8px;
                display: block;
                font-family: 'Glyphicons Halflings';
                opacity: 0.5;
            }
            .sorting:after {
                opacity: 0.2;content: "\e150";
                /* sort */
            }
            .sorting_asc:after {
                content: "\e155";
                /* sort-by-attributes */
            }
            .sorting_desc:after {
                content: "\e156";
                /* sort-by-attributes-alt */
            }
            .sorting_asc_disabled:after,
            .sorting_desc_disabled:after { color: #eee; }
        }

        tbody {
            tr {
                -webkit-transition: all .5s cubic-bezier(.175,.885,.32,1);
                transition: all .5s cubic-bezier(.175,.885,.32,1);
                &.row-selected {
                    box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
                    -moz-box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
                    -webkit-box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
                    td { background-color: #FDECAD !important; }
                }
                td {
                    color: #666666;
                    background: white;
                }
                &:last-child td {
                    &:first-child { border-bottom-left-radius: $borderRadius; }
                    &:last-child { border-bottom-right-radius: $borderRadius; }
                }
            }
        }

        &.table-condensed {
            & > thead > tr > th { padding-right: 20px; }
            .sorting:after,
            .sorting_asc:after,
            .sorting_desc:after { top: 6px;right: 6px; }
        }

        &.table-bordered {
            th, td { border-left-width: 0; }
            th:last-child,
            td:last-child { border-right-width: 0; }
            tbody th, tbody td { border-bottom-width: 0; }
        }
        &.table-striped>tbody>tr:nth-child(odd)>td { background: #F5F5F5; }
    }

    div.vTableGrid_scrollHead table.vTableGrid {
        margin-bottom: 0 !important;
    }

    div.vTableGrid_scrollBody > table {
        border-top: none;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        & > thead .sorting:after,
        & > thead .sorting_asc:after,
        & > thead .sorting_desc:after { display: none; }
        & > tbody > tr:first-child > th,
        & > tbody > tr:first-child > td { border-top: none; }
    }

    div.vTableGrid_scrollFoot > table {
        margin-top: 0 !important;
        border-top: none;
    }

    div.vTableGrid_scrollHead table.table-bordered { border-bottom-width: 0; }

    div.table-responsive > div.vTableGrid_wrapper > div.row {
        margin: 0;
        & > div[class^="col-"]:first-child { padding-left: 0; }
        & > div[class^="col-"]:last-child { padding-right: 0; }
    }

    .table{
        border-color: $borderColor !important;
        -webkit-border-radius: $borderRadius;
        -moz-border-radius: 2$borderRadius;
        border-radius: $borderRadius;
    }
    .table > thead > tr > th,
    .table > tbody > tr > th,
    .table > tfoot > tr > th,
    .table > thead > tr > td,
    .table > tbody > tr > td,
    .table > tfoot > tr > td {
        /*border-top: 1px solid $borderColor !important;*/
        border-color: $borderColor;
    }
    .table > thead > tr > th {
        /*border-bottom: 2px solid $borderColor !important;*/
        border-color: $borderColor;
    }
    .table-bordered > thead > tr > th,
    .table-bordered > tbody > tr > th,
    .table-bordered > tfoot > tr > th,
    .table-bordered > thead > tr > td,
    .table-bordered > tbody > tr > td,
    .table-bordered > tfoot > tr > td {
        /*border: 1px solid $borderColor !important;*/
        border-color: $borderColor;
    }

    @media screen and (max-width: 767px) {
        div.vTableGrid_wrapper div.vTableGrid_length,
        div.vTableGrid_wrapper div.vTableGrid_filter,
        div.vTableGrid_wrapper div.vTableGrid_info,
        div.vTableGrid_wrapper div.vTableGrid_paginate { text-align: center; }
    }
</style>