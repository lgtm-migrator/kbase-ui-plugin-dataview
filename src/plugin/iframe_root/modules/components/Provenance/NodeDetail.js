define([
    'preact',
    'htm',
    'components/Row',
    'components/Col',
    'components/Alert',

    'css!./NodeDetail.css'
], (
    preact,
    htm,
    Row,
    Col,
    Alert
) => {
    const {Component, Fragment} = preact;
    const html = htm.bind(preact.h);


    function renderRow(rowTitle, rowContent, title) {
        if (typeof title === 'undefined') {
            title = rowContent;
        }
        return html`
            <tr>
                <th>${rowTitle}</th>
                <td>
                    <div class="CellContent" title=${title}>
                        ${rowContent}
                    </div>
                </td>
            </tr>
        `;
    }

    function renderLinkRow(rowTitle, url, label, title) {
        return renderRow(
            rowTitle,
            html`<a href=${url} target="_blank">${label}</a>`, title || label);
    }

    function authScrub(objectList) {
        if (objectList && objectList.constructor === Array) {
            for (let k = 0; k < objectList.length; k++) {
                if (objectList[k] && typeof objectList[k] === 'object') {
                    if ('auth' in objectList[k]) {
                        delete objectList[k].auth;
                    }
                }
            }
        }
        return objectList;
    }

    function formatDate(objInfoTimeStamp) {
        if (!objInfoTimeStamp) {
            return '';
        }
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let date = new Date(objInfoTimeStamp);
        let seconds = Math.floor((new Date() - date) / 1000);

        // f-ing safari, need to add extra ':' delimiter to parse the timestamp
        if (isNaN(seconds)) {
            const tokens = objInfoTimeStamp.split('+'); // this is just the date without the GMT offset
            const newTimestamp = `${tokens[0]  }+${  tokens[0].substr(0, 2)  }:${  tokens[1].substr(2, 2)}`;
            date = new Date(newTimestamp);
            seconds = Math.floor((new Date() - date) / 1000);
            if (isNaN(seconds)) {
                // just in case that didn't work either, then parse without the timezone offset, but
                // then just show the day and forget the fancy stuff...
                date = new Date(tokens[0]);
                return `${months[date.getMonth()]  } ${  date.getDate()  }, ${  date.getFullYear()}`;
            }
        }

        // keep it simple, just give a date
        return `${months[date.getMonth()]  } ${  date.getDate()  }, ${  date.getFullYear()}`;
    }
    function renderJSONRow(rowTitle, rowContent, {title} = {}) {
        if (typeof title === 'undefined') {
            title = rowContent;
        }

        const content = JSON.stringify(authScrub(rowContent), null, '  ');

        return html`
            <tr>
                <th>${rowTitle}</th>
                <td>
                    <div class="CellContent" title=${title}>
                        <div class="ProvenancePanel-Code">${content}</div>
                    </div>
                </td>
            </tr>
        `;
    }

    class NodeDetail extends Component {
        renderObjectDetails() {
            if (this.props.node.nodeInfo === null) {
                return html`
                    <${Alert} type="info" message="Hover over graph node to display" />
                `;
            }
            const objectInfo = this.props.node.nodeInfo.info;
            return html`
                <table class="table table-striped table-bordered ObjectDetails">
                    <tbody>
                        ${renderLinkRow('Name',`/#dataview/${objectInfo.ref}`, objectInfo.name)}
                        ${renderLinkRow('Object ID', `/#dataview/${objectInfo.ref}`, objectInfo.ref)}
                        ${renderLinkRow('Type', `/#spec/type/${objectInfo.type}`, objectInfo.type)}
                        ${renderRow('Saved on', html` ${formatDate(objectInfo.save_date)}`,  formatDate(objectInfo.save_date))}
                        ${renderLinkRow('Saved by', `/#people/${objectInfo.saved_by}`, objectInfo.saved_by)}
                    </tbody>
                </table>
            `;
        }

        renderObjectMetadata() {
            if (this.props.node.nodeInfo === null) {
                return html`
                    <${Alert} type="info" message="Hover over graph node to display" />
                `;
            }
            const objectInfo = this.props.node.nodeInfo.info;
            if (objectInfo.metadata && Object.keys(objectInfo.metadata).length > 0) {
                const rows = Object.entries(objectInfo.metadata).map(([key, value]) => {
                    return renderRow(key, value);
                });
                return html`
                    <table class="table table-striped table-bordered">
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                `;
            }
            return html`
                <${Alert} type="neutral" message="No metadata" />
            `;
        }

        getProvRows(provenanceAction, prefix) {
            /* structure {
                 timestamp time;
                 string service;
                 string service_ver;
                 string method;
                 list<UnspecifiedObject> method_params;
                 string script;
                 string script_ver;
                 string script_command_line;
                 list<obj_ref> input_ws_objects;
                 list<obj_ref> resolved_ws_objects;
                 list<string> intermediate_incoming;
                 list<string> intermediate_outgoing;
                 string description;
                 } ProvenanceAction;*/
            const rows = [];
            if ('description' in provenanceAction) {
                rows.push(renderRow(`${prefix}Description`, provenanceAction['description']));
            }
            if ('service' in provenanceAction) {
                rows.push(renderRow(`${prefix}Service Name`, provenanceAction['service']));
            }
            if ('service_ver' in provenanceAction) {
                rows.push(renderRow(`${prefix}Service Version`, provenanceAction['service_ver']));
            }
            if ('method' in provenanceAction) {
                rows.push(renderRow(`${prefix}Method`, provenanceAction['method']));
            }
            if ('method_params' in provenanceAction) {
                rows.push(
                    renderJSONRow(
                        `${prefix  }Method Parameters`,
                        provenanceAction['method_params']
                    )
                );
            }

            if ('script' in provenanceAction) {
                rows.push(renderRow(`${prefix  }Command Name`, provenanceAction['script']));
            }
            if ('script_ver' in provenanceAction) {
                rows.push(renderRow(`${prefix  }Script Version`, provenanceAction['script_ver']));
            }
            if ('script_command_line' in provenanceAction) {
                rows.push(renderRow(`${prefix  }Command Line Input`, provenanceAction['script_command_line']));
            }

            if ('intermediate_incoming' in provenanceAction) {
                if (provenanceAction['intermediate_incoming'].length > 0)
                    rows.push(
                        renderJSONRow(
                            `${prefix  }Action Input`,
                            provenanceAction['intermediate_incoming']
                        )
                    );
            }
            if ('intermediate_outgoing' in provenanceAction) {
                if (provenanceAction['intermediate_outgoing'].length > 0)
                    rows.push(
                        renderJSONRow(
                            `${prefix  }Action Output`,
                            provenanceAction['intermediate_outgoing']
                        )
                    );
            }

            if ('external_data' in provenanceAction) {
                if (provenanceAction['external_data'].length > 0) {
                    rows.push(
                        renderJSONRow(
                            `${prefix  }External Data`,
                            provenanceAction['external_data']
                        )
                    );
                }
            }

            if ('time' in provenanceAction) {
                rows.push(renderRow(`${prefix  }Timestamp`, formatDate(provenanceAction['time'])));
            }

            return rows;
        }

        renderProvenanceTable() {
            if (this.props.node.nodeInfo === null) {
                return html`
                    <${Alert} type="info" message="Hover over graph node to display" />
                `;
            }
            const {objdata: objectData} = this.props.node.nodeInfo;
            if (objectData.provenance.length === 0) {
                return html`
                    <${Alert} type="neutral" message="No provenance data set." />
                `;
            }
            const rows = [];
            if ('copied' in objectData) {
                rows.push(html`
                    <tr>
                        <th>Copied from</th>
                        <td>
                            <a href="/#dataview/${objectData.copied}" target="_blank">
                                ${objectData.copied}
                            </a>
                        </td>
                    </tr>
                `);
            }
            if (objectData.provenance.length > 0) {
                objectData.provenance.forEach((provenance, index) => {
                    const prefix = (() => {
                        if (objectData.provenance.length > 1) {
                            return `Action ${index}: `;
                        }
                        return '';
                    })();
                    rows.push(...this.getProvRows(provenance, prefix));
                });
            }

            if (rows.length > 0) {
                return html`
                    <table class="table table-striped table-bordered Provenance">
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                `;
            }
            return html`
                <${Alert} type="neutral" message="No provenance data set." />
            `;
        }


        render() {
            const detailClass = this.props.node.over ? 'NodeHovered' : 'NodeNotHovered';
            return html`
                <${Fragment}>
                    <${Row} style=${{marginBottom: '1em'}}>
                        <${Col}style=${{flex: '1 1 0', marginRight: '0.5em'}}>
                            <div class=${`ObjectDetails ${detailClass}`}>
                                <h4>Data Object Details</h4>
                                ${this.renderObjectDetails()}
                            </div>
                        <//>
                        <${Col}style=${{flex: '1.75 1 0'}}>
                            <div class=${`Provenance ${detailClass}`}>
                                <h4>Provenance</h4>
                                ${this.renderProvenanceTable()}
                            </div>
                        <//>
                    <//>
                    <${Row}>
                        <${Col}style=${{flex: '1 1 0'}}>
                            <div class=${`ObjectMetadata ${detailClass}`}>
                                <h4>Metadata</h4>
                                ${this.renderObjectMetadata()}
                            </div>
                        <//>
                    <//>
                <//>
            `;
        }
    }

    return NodeDetail;
});