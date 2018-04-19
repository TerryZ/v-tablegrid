const con = {
    checkSingle: 'single',
    checkMulti: 'multi',
    orderAsc: 'asc',
    orderDesc: 'desc'
};

const defaults = {
    /**
     * Table data source
     * @type object | string
     * object type format
     * {
     *       //pagination info
     *       "pageSize":10,
     *       "pageNumber":1,
     *       "totalRow":3,
     *       "totalPage":1,
     *       //row data collections
     *       "list":[
     *           //row data
     *           {
     *               "id":1,
     *               "prop2":"",
     *               "status":1,
     *               "remark":"",
     *               "prop1":"",
     *               "statusName":"Enabled",
     *               "description":"System name",
     *               "value":"Admin system",
     *               "code":"SYSTEM_CAPTION"
     *           },
     *           {...}
     *        ]
     * }
     * string type url format
     * '/user/profile'
     */
    data: undefined,
    /**
     * Row select mode
     * @type string | boolean
     * @enum 'single' - default
     * @enum 'multi'
     * @enum false - close check column
     */
    pCheck: 'single',
    /**
     * Table column sort
     * @type boolean
     */
    pSorting: false,
    /**
     * Sort column name
     */
    pSortColumn: undefined,
    /**
     * Column sort order
     * @type string
     * @enum 'asc' - default
     * @enum 'desc'
     */
    pSortOrder: 'asc',
    /**
     * Whether show pagination bar
     * @type boolean
     */
    pPagination: true
};

export default {
    defaults,
    con
};