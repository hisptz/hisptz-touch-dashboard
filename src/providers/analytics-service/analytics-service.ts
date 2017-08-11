import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import * as _ from 'lodash';
import {HttpClientProvider} from "../http-client/http-client";

/*
  Generated class for the AnalyticsServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class AnalyticsServiceProvider {

  constructor(public http: HttpClientProvider) {}

  getAnalytics(visualizationDetails: any,currentUser) {
    const visualizationObject = _.clone(visualizationDetails.visualizationObject);
    return Observable.create(observer => {
      Observable.forkJoin(visualizationDetails.filters.map(filterObject => {
        let analyticUrl = '';
        const parametersArray: any[] = this._getParametersArray(filterObject.filters);
        if (parametersArray.length > 0) {
          const parameters: string = parametersArray.join('&');
          let visualizationSettings = this._getVisualizationSettings(visualizationDetails.favorite, filterObject.id);
          if (visualizationSettings == null) {
            visualizationSettings = _.filter(_.map(visualizationObject.layers, (layer: any) => {
              return layer.settings
            }), (setting) => {
              return setting.id === filterObject.id
            })[0];
          }

          analyticUrl = this._constructAnalyticsUrl(
            visualizationDetails.apiRootUrl,
            visualizationObject.type,
            visualizationSettings,
            parameters
          )
        }
        return analyticUrl !== '' ? this.http.get(analyticUrl,currentUser) : Observable.of(null)
      })).subscribe((analyticsResponse : any) => {
        analyticsResponse = JSON.parse(analyticsResponse.data);
        visualizationDetails.analytics = _.filter(_.map(visualizationDetails.filters, (filter: any, filterIndex) => {
          return {id: filter.id, content: analyticsResponse[filterIndex]}
        }), (analytics) => {
          return analytics.content !== null;
        });

        observer.next(visualizationDetails);
        observer.complete();
      }, error => {
        visualizationDetails.error = error;
        observer.next(visualizationDetails);
        observer.complete();
      })
    });
  }

  private _getParametersArray(filters: any[]) {
    return _.filter(_.map(filters, (filter) => {
      return filter.value !== '' ? 'dimension=' + filter.name + ':' + filter.value : ['dx', 'pe', 'ou'].indexOf(filter.name) === -1 ? 'dimension=' + filter.name : ''
    }), param => {
      return param !== ''
    });
  }

  private _getVisualizationSettings(favoriteObject, settingsId) {
    let settings: any = null;
    if (favoriteObject) {
      if (favoriteObject.mapViews) {
        settings = _.find(favoriteObject.mapViews, ['id', settingsId])
      } else if (favoriteObject.id === settingsId) {
        settings = favoriteObject
      }
    }
    return settings;
  }

  private _constructAnalyticsUrl(apiRootUrl: string,
                                 visualizationType: string,
                                 visualizationSettings: any,
                                 parameters: any) {

    if (!visualizationSettings) {
      return '';
    }
    let url: string = apiRootUrl + 'analytics';
    const aggregationType: string = visualizationSettings.hasOwnProperty('aggregationType') ? '&aggregationType=' + visualizationSettings.aggregationType : '';
    const value: string = visualizationSettings.hasOwnProperty('value') ? '&value=' + visualizationSettings.value.id : '';

    if (visualizationType === 'EVENT_CHART') {
      url += '/events/aggregate/' + this._getProgramParameters(visualizationSettings);

    } else if (visualizationType === 'EVENT_REPORT') {

      if (visualizationSettings.hasOwnProperty('dataType')) {
        if (visualizationSettings.dataType === 'AGGREGATED_VALUES') {
          url += '/events/aggregate/' + this._getProgramParameters(visualizationSettings);
        } else {
          url += '/events/query/' + this._getProgramParameters(visualizationSettings);
        }
      }

    } else if (visualizationType === 'EVENT_MAP') {

      url += '/events/aggregate/' + this._getProgramParameters(visualizationSettings);

    } else if (visualizationType === 'MAP' && visualizationSettings.layer === 'event') {

      if (visualizationSettings.aggregate) {
        url += '/events/aggregate/' + this._getProgramParameters(visualizationSettings);
      } else {
        url += '/events/query/' + this._getProgramParameters(visualizationSettings);
      }

      /**
       * Also get startDate and end date if available
       */
      if (visualizationSettings.hasOwnProperty('startDate') && visualizationSettings.hasOwnProperty('endDate')) {
        url += 'startDate=' + visualizationSettings.startDate + '&' + 'endDate=' + visualizationSettings.endDate + '&';
      }

    } else {
      url += '.json?';
    }

    if (url.split('&').length <= 1 && parameters.split('&').length <= 1) {
      return '';
    }
    if (parameters !== '') {
      url += parameters;
    }
    url += value !== '' || value !== undefined ? value : '';
    url += aggregationType !== '' ? aggregationType : '';
    url += this._getAnalyticsCallStrategies(visualizationType, null);
    return url;
  }

  private _getAnalyticsCallStrategies(visualizationType, layerType: string = null): string {
    let strategies = '';
    strategies += visualizationType === 'EVENT_CHART' || visualizationType === 'EVENT_REPORT' || visualizationType === 'EVENT_MAP' ? '&outputType=EVENT' : '';
    strategies += '&displayProperty=NAME';
    strategies += layerType !== null && layerType === 'event' ? '&coordinatesOnly=true' : '';
    return strategies;
  }

  private _getProgramParameters(favoriteObject: any): string {
    let params = '';
    if (favoriteObject.hasOwnProperty('program') && favoriteObject.hasOwnProperty('programStage')) {

      if (favoriteObject.program.hasOwnProperty('id') && favoriteObject.programStage.hasOwnProperty('id')) {
        params = favoriteObject.program.id + '.json?stage=' + favoriteObject.programStage.id + '&';
      }
    }
    return params;
  }

  mergeAnalytics(splitedAnalyticsArray) {
    const mergedRows: any[] = [];
    let headers: any[] = [];
    const metadataNames: any = {};
    const metadata: any = {};
    if (splitedAnalyticsArray) {
      splitedAnalyticsArray.forEach((analyticsObject: any) => {
        if (analyticsObject) {
          const rows = analyticsObject.rows;
          headers = analyticsObject.headers;
          const metadataKeys = _.keys(analyticsObject.metaData);
          metadataKeys.forEach(metadataKey => {
            const metadataKeyValues = analyticsObject.metaData[metadataKey];
            if (metadataKey === 'names') {
              const metadataNamesKeys = _.keys(metadataKeyValues);
              metadataNamesKeys.forEach(metadataNameKey => {
                metadataNames[metadataNameKey] = analyticsObject.metaData.names[metadataNameKey];
              })
            } else {
              const metadataIds = analyticsObject.metaData[metadataKey];
              if (metadataIds.length > 0) {
                metadataIds.forEach(metadataId => {
                  if (metadata[metadataKey]) {
                    const metadataIdIndex = _.indexOf(metadata[metadataKey], metadataId);
                    if (metadataIdIndex === -1) {
                      metadata[metadataKey].push(metadataId);
                    }
                  } else {
                    metadata[metadataKey] = [];
                    metadata[metadataKey].push(metadataId);
                  }
                })
              } else {
                metadata[metadataKey] = [];
              }
            }
          });
          /**
           * Get rows
           */
          if (rows) {
            rows.forEach(row => {
              mergedRows.push(row);
            })
          }
        }
      })
    }
    metadata.names = metadataNames;
    return {
      headers: headers,
      metaData: metadata,
      rows: mergedRows
    }
  }

  splitAnalytics(analytics: any, splitCriteria: any[]) {
    const analyticsArray: any[] = [];
    const analyticHeaders: any[] = analytics.headers;
    let analyticsMetadata: any[] = [];
    /**
     * split metadata based on dimension selected
     */
    if (analytics.metaData) {
      analyticsMetadata = [analytics.metaData];
      splitCriteria.forEach(criteria => {
        analyticsMetadata = this.splitAnalyticsMetadata(analyticsMetadata, criteria);
      });
    }

    /**
     * split the corresponding rows
     */
    if (analyticsMetadata.length > 0) {
      analyticsMetadata.forEach((metadata: any) => {
        let rows: any[] = analytics.rows;
        const metadataNames: any = {};
        const newMetadata: any = _.clone(metadata);
        if (rows.length > 0) {
          splitCriteria.forEach(criteria => {
            const rowIndex = _.findIndex(analyticHeaders, ['name', criteria]);
            const id = metadata[criteria][0];
            rows = this.splitAnalyticsRows(rows, id, rowIndex);
            /**
             * Get names
             */
            const headersNameArray = analyticHeaders.map(header => {
              return header.name
            });
            headersNameArray.forEach(headerName => {
              metadataNames[headerName] = metadata.names[headerName];
              if (metadata[headerName]) {
                metadata[headerName].forEach(metadataName => {
                  metadataNames[metadataName] = metadata.names[metadataName];
                });
              }
            });
            metadata[criteria].forEach(metadataCriteria => {
              metadataNames[metadataCriteria] = metadata.names[metadataCriteria];
            });
            newMetadata.names = metadataNames;
          });
        }
        analyticsArray.push({
          headers: analyticHeaders,
          metaData: newMetadata,
          rows: rows
        })
      })
    }
    return analyticsArray;
  }

  splitAnalyticsMetadata(analyticsMetadataArray, splitDimension): any {
    const metadataArray: any[] = [];
    if (analyticsMetadataArray) {
      analyticsMetadataArray.forEach(metadata => {
        if (metadata[splitDimension]) {
          metadata[splitDimension].forEach(metadataDimension => {
            const newMetadata: any = _.clone(metadata);
            newMetadata[splitDimension] = [metadataDimension];
            metadataArray.push(newMetadata)
          })
        }
      })
    }
    return metadataArray;
  }

  splitAnalyticsRows(analyticsRows, splitDimensionId, dimensionIndex) {
    const newRowsArray: any[] = [];
    if (analyticsRows) {
      analyticsRows.forEach(row => {
        if (row[dimensionIndex] === splitDimensionId) {
          newRowsArray.push(row)
        }
      })
    }
    return newRowsArray;
  }

  organizeSplitsIntoLayers(splitedAnalytics, splitedFavorites, visualizationObject) {
    if (splitedAnalytics.length > 0 && splitedFavorites > 0) {
      console.log(splitedAnalytics, splitedFavorites);
    } else {
      console.log(splitedAnalytics, splitedFavorites);
      return visualizationObject.layers;
    }
  }

  mapEventClusteredAnalyticsToAggregate(analyticsObject) {
    console.log(analyticsObject)
    return analyticsObject;
  }

}